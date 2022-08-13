import { GraphQLYogaError } from '@graphql-yoga/node'

const isAdmin = (context) => {
  const user = context.req.user
  const role = context.req.user.role
  if (user && role === 'admin') {
    return user
  } else {
    throw new GraphQLYogaError('Bu işlemi yapmak için yetkiniz yok')
  }
}

export default isAdmin
