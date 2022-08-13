import { mergeResolvers } from '@graphql-tools/merge'

import UserResolver from './User'

const resolvers = [UserResolver]

export default mergeResolvers(resolvers)
