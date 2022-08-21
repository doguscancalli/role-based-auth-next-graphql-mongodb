import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { GraphQLYogaError } from '@graphql-yoga/node'
import sgMail from '@sendgrid/mail'
import {
  advancedFiltering,
  generateToken,
  validateRegisterRoute,
  validateLoginRoute,
  validateResetPasswordRoute,
  validateUpdatePasswordRoute,
} from '@utils'

const UserResolver = {
  Query: {
    users: async (_, args, context) => {
      const { input } = args
      await context.isAuth(context)
      context.isAdmin(context)
      const users = await advancedFiltering(context.User, input)
      return users
    },
    user: async (_, args, context) => {
      const { id } = args
      await context.isAuth(context)
      context.isAdmin(context)
      const user = await context.User.findById(id)
      if (!user) throw new GraphQLYogaError('Kullanıcı bulunamadı')
      return user
    },
    me: async (_, __, context) => {
      const { id } = await context.isAuth(context)
      const user = await context.User.findById(id)
      if (!user) throw new GraphQLYogaError('Kullanıcı bulunamadı')
      return user
    },
  },
  Mutation: {
    registerUser: async (_, args, context) => {
      let {
        input: { name, email, password },
      } = args
      {
        email = email.toLowerCase()
        const { valid, errors } = validateRegisterRoute(name, email, password)
        if (!valid) throw new GraphQLYogaError(Object.values(errors))
        const user = await context.User.findOne({ email })
        if (user) throw new GraphQLYogaError('Bu eposta kullanılıyor')
        const hashedPassword = await bcrypt.hash(password, 12)
        const newUser = new context.User({
          name,
          email,
          password: hashedPassword,
        })
        const res = await newUser.save()
        const token = generateToken(res)
        return {
          id: res._id,
          ...res._doc,
          token,
        }
      }
    },
    loginUser: async (_, args, context) => {
      let {
        input: { email, password },
      } = args
      email = email.toLowerCase()
      const { errors, valid } = validateLoginRoute(email, password)
      console.log(errors)
      if (!valid) throw new GraphQLYogaError(Object.values(errors))
      const user = await context.User.findOne({ email }).select('+password')
      if (!user) {
        throw new GraphQLYogaError('Kullanıcı bulunamadı')
      }
      if (user.bannedExp && user.bannedExp > new Date()) {
        throw new GraphQLYogaError('Hesabınız engellenmiştir')
      }
      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        throw new GraphQLYogaError('Kullanıcı bilgileri hatalı')
      }
      const token = generateToken(user)
      return {
        id: user._id,
        ...user._doc,
        token,
      }
    },
    deleteUser: async (_, args, context) => {
      const { id } = args
      await context.isAuth(context)
      context.isAdmin(context)
      const user = await context.User.findById(id)
      if (!user) throw new GraphQLYogaError('Kullanıcı bulunamadı')
      await user.remove()
      return true
    },
    deleteAllUsers: async (_, __, context) => {
      await context.isAuth(context)
      context.isAdmin(context)
      await User.deleteMany({})
      return true
    },
    updateUser: async (_, args, context) => {
      let {
        id,
        input: { name, email, role },
      } = args
      email = email?.toLowerCase()
      const { id: authUserId, role: authUserRole } = await context.isAuth(
        context
      )
      if (id !== authUserId && authUserRole !== 'admin')
        throw new GraphQLYogaError(
          'Sadece kendi hesabınızı güncelleyebilirsiniz'
        )
      const isEmailExist = await context.User.findOne({ email })
      if (isEmailExist) throw new GraphQLYogaError('Bu eposta kullanılıyor')
      let user
      if (authUserRole === 'admin') {
        user = await context.User.findByIdAndUpdate(
          id,
          { name, email, role },
          { new: true }
        )
      } else {
        user = await context.User.findByIdAndUpdate(
          id,
          { name, email },
          { new: true }
        )
      }
      if (!user) throw new GraphQLYogaError('Kullanıcı bulunamadı')
      const token = generateToken(user)
      user.token = token
      return user
    },
    forgotPassword: async (_, args, context) => {
      let { email } = args
      email = email.toLowerCase()
      const user = await context.User.findOne({ email })
      if (!user) throw new GraphQLYogaError('Kullanıcı bulunamadı')
      const resetToken = nanoid(64)
      user.resetPasswordToken = resetToken
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000
      await user.save()
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/sifre-sifirlama?token=${resetToken}`
      const text = `Bu epostayı, siz (veya bir başkası) şifrenizin sıfırlanmasını talep ettiği için alıyorsunuz. Şifrenizi sıfırlamak için bu linke gidin:\n\n${resetUrl}`
      const data = {
        to: email,
        from: 'destek@mysandbox.com',
        subject: 'Şifre Sıfırlama',
        text,
      }
      try {
        await sgMail.setApiKey(process.env.SENDGRID_API_KEY).send(data)
      } catch (err) {
        throw new GraphQLYogaError(err)
      }
      return true
    },
    resetPassword: async (_, args, context) => {
      const { token, password } = args
      const user = await context.User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      })
      if (!user) throw new GraphQLYogaError('Token geçersiz')
      const { errors, valid } = validateResetPasswordRoute(password)
      if (!valid) throw new GraphQLYogaError(Object.values(errors))
      const hashedPassword = await bcrypt.hash(password, 12)
      user.password = hashedPassword
      user.resetPasswordToken = undefined
      user.resetPasswordExpire = undefined
      await user.save()
      return true
    },
    updatePassword: async (_, args, context) => {
      const { password, newPassword } = args
      const { errors, valid } = validateUpdatePasswordRoute(
        password,
        newPassword
      )
      if (!valid) throw new GraphQLYogaError(Object.values(errors))
      const { id } = await context.isAuth(context)
      const user = await context.User.findById(id).select('+password')
      if (!user) throw new GraphQLYogaError('Kullanıcı bulunamadı')
      if (!(await bcrypt.compare(password, user.password)))
        throw new GraphQLYogaError('Şifre hatalı')
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      user.password = hashedPassword
      await user.save()
      return true
    },
    banUser: async (_, args, context) => {
      const {
        input: { id, bannedExp, bannedReason },
      } = args
      await context.isAuth(context)
      const { id: authUserId } = context.isAdmin(context)
      const user = await context.User.findById(id)
      if (!user) throw new GraphQLYogaError('Kullanıcı bulunamadı')
      user.bannedExp = bannedExp
      user.bannedReason = bannedReason
      user.bannedBy = authUserId
      await user.save()
      return true
    },
  },
}

export default UserResolver
