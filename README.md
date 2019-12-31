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

#### schema/schema.js
The GraphQL schema is defined as follows:
``` javascript
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
  accounts {
    id,
    accountId,
    accountType,
    accountSubType,
    description
  }
}
```
#####  Get customer account

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

### MongoDB

### Mongo Express

### Redis


