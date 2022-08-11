import { createServer } from '@graphql-yoga/node'
import typeDefs from '@typedefs'
import resolvers from '@resolvers'
import { connectDb } from '@utils'

const server = createServer({
  graphiql: false,
  schema: {
    typeDefs,
    resolvers,
  },
})

connectDb()

export default server
