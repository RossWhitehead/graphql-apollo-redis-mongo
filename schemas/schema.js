const { gql } = require('apollo-server')

const typeDefs = gql`
	type Query {
		accounts: [Account] @cacheControl(maxAge: 600)
		customersAccounts(customerId: ID!): [CustomerAccount]
		customerAccount(id: ID!): CustomerAccount
	}

	type CustomerAccount {
		id: ID!
		customerId: ID!
		identification: String!
		accountId: ID!
		account: Account!
		balance: Float!
	}

	type Account @cacheControl(maxAge: 600) {
		id: ID!
		accountId: ID!
		accountType: String!
		accountSubType: String!
		description: String!
	}
`

module.exports = typeDefs