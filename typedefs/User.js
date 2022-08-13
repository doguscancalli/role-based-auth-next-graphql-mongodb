const UserType = /* GraphQL */ `
  # Scalar
  scalar Date

  # Type
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    token: String
    resetPasswordToken: String
    resetPasswordExpire: Date
    bannedExp: Date
    bannedReason: String
    bannedBy: String
    createdAt: Date!
    updatedAt: Date!
  }
  type Users {
    docs: [User!]!
    totalDocs: Int
    limit: Int
    totalPages: Int
    page: Int
    prevPage: Int
    nextPage: Int
  }

  # Input
  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }
  input LoginInput {
    email: String!
    password: String!
  }
  input UpdateUserInput {
    name: String
    email: String
    role: String
  }
  input FilterUsersInput {
    limit: String
    page: String
    createdAt: String
    sort: String
  }
  input BanUserInput {
    id: ID!
    bannedExp: Date!
    bannedReason: String!
  }

  # Query
  type Query {
    users(input: FilterUsersInput!): Users!
    user(id: ID!): User!
    me: User
  }

  # Mutation
  type Mutation {
    registerUser(input: RegisterInput!): User!
    loginUser(input: LoginInput!): User!
    deleteUser(id: ID!): Boolean!
    deleteAllUsers: Boolean!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, password: String!): Boolean!
    updatePassword(password: String!, newPassword: String!): Boolean!
    banUser(input: BanUserInput!): Boolean!
  }
`

export default UserType
