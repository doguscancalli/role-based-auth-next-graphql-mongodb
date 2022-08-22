import { verify } from 'jsonwebtoken'
import { GraphQLYogaError } from '@graphql-yoga/node'

const isAuth = async (context) => {
  const authHeader = context.req.headers.authorization
  const authCookie = context.req.cookies.token
  let token
  let user
  if (authHeader) {
    token = authHeader.split('Bearer ')[1]
  }

  if (authCookie) {
    token = authCookie
  }
  if (token) {
    try {
      const tokenUser = verify(token, process.env.JWT_SECRET)
      context.req.user = tokenUser
      user = tokenUser
    } catch (err) {
      throw new GraphQLYogaError('Geçersiz/Süresi Dolmuş Token')
    }
  } else {
    throw new GraphQLYogaError('Authorization header bilgisi bulunamadı')
  }
  const dbUser = await context.User.findById(user.id)
  if (!dbUser) throw new GraphQLYogaError('Kullanıcı bulunamadı')
  if (dbUser.banRecords.length > 0) {
    const banRecord = dbUser.banRecords.find(
      (record) => record.expire > new Date()
    )
    if (banRecord) {
      throw new GraphQLYogaError(
        `Hesabınız ${banRecord.reason} nedeniyle ${new Date(
          banRecord.expire
        ).toLocaleString()} tarihine kadar engellenmiştir.`
      )
    }
  }
  return user
}

export default isAuth
