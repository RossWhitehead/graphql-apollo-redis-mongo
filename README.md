# graphql-apollo-redis-mongo
As it says on the tin -

A GraphQL Apollo service, sourcing data from MongoDB, and caching data in Redis.

> Status: Can't see anything being cached in Redis. Need to work this through.

## Build and run
```
docker-compose up
```

## Services

### Accounts service

Apollo GraphQL service

#### Schema
The GraphQL schema is defined as follows:
``` javascript
// schemas/schema.js 

  type Query {
    accounts: [Account]
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

  type Account @cacheControl(maxAge:600) {
    id: ID!
    accountId: ID!
    accountType: String!
    accountSubType: String!
    description: String!
  }
```
Thus the following queries are supported:

#####  Get list of accounts

``` json
{
  accounts {
    id,
    accountId,
    accountType,
    accountSubType,
    description
  }
}
```
#####  Get customer's accounts

``` json
{
  customersAccounts(customerId: 1) {
    id,
    customerId,
    identification
    accountId,
    account {
      id,
      accountId,
      accountType,
      accountSubType,
      description
    },
    balance
  }
}
```
#####  Get customer account

``` json
{
  customerAccount(id: "5e0f33d702c18e5331e8267b") {
    id,
    customerId,
    identification
    accountId,
    account {
      id,
      accountId,
      accountType,
      accountSubType,
      description
    },
    balance
  }
}
```
#### Resolvers
Each query has a resolver. And additionally, there is a resolver for the CustomerAccount.account field, which overrides the null value that is returned by default.
``` javascript
// resolvers/resolvers.js

Query: {
  accounts: (_, __, context) => 
    context.accountsDataSource.findAll().then((accounts) => 
      accounts.map((account) => mapAccount(account))
    ),
  customersAccounts: (_, { customerId }, context) => 
    context.customerAccountsDataSource.find({ "customerId": parseInt(customerId) }).then((customerAccounts) => 
      customerAccounts.map((customerAccount) => mapCurrentAccount(customerAccount))
    ),
  customerAccount: (_, { id }, context) => 
    context.customerAccountsDataSource.findById(id).then((customerAccounts) => 
      customerAccounts.map((customerAccount) => mapCurrentAccount(customerAccount))
    )
},
CustomerAccount: {
  account: (customerAccount, __, context) => 
    context.accountsDataSource.find({"accountId": customerAccount.accountId}).then((accounts) => 
      accounts.map((account) => mapAccount(account))
    )
  }
```

### MongoDB

### Mongo Express

### Redis


