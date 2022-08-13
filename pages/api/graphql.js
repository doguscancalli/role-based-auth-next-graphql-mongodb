import { createServer } from '@graphql-yoga/node'
import typeDefs from '@typedefs'
import resolvers from '@resolvers'
import { connectDb, isAuth, isAdmin } from '@utils'
import { User } from '@models'

const server = createServer({
  graphiql: false,
  schema: {
    typeDefs,
    resolvers,
  },
  context: ({ req }) => ({ req, User, isAuth, isAdmin }),
})

connectDb()

export default server
