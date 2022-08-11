import { createServer } from '@graphql-yoga/node'
import typeDefs from '@typedefs'
import resolvers from '@resolvers'

const server = createServer({
  graphiql: false,
  schema: {
    typeDefs,
    resolvers,
  },
})

export default server
