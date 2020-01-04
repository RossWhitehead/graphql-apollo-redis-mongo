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

http://localhost:4000

#### Index.js
Uses the MongoDB node.js client SDK to connect to the MongoDB service.

The MongoDB client contain retry functionality which re-establishes a connection if an open connection fails. But if there is a failure in initializing a connection then rather than retrying the MongoDB client throws and error. 

For this demo, in the docker-compose file the accounts service depends on the mongo service. This will ensure that the mongo service is healthy prior to the accounts service being created. However, there is no guarantee that the mongo banking database has been initalised and is ready. To accomodate this, I have used the promise-retry library to retry initializing the client connection until successfull.

```
  const connect = (url) => {
    return promiseRetry((retry, number) => {
      console.log(`MongoClient connecting to ${url} - retry number: ${number}`)
      return MongoClient.connect(url, connectOptions).catch(retry)
    }, promiseRetryOptions)
  }

  connect(MONGO_URL).then((client) => {
    console.log("Mongo client connected.")
    ...
  })
```

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
#### Data sources
I have a created a MongoDB data-source class, datasources/mongodb-datasource.MongoDBDataSource.

The class extends the apollo-datasource.DataSource class, and utilises the MongoDB node.js client SDK in implementing the following methods:
```
 async findAll() {
    const docs = await this.collection.find({}).toArray()
    return docs
  }

  async find(query) {
    console.log({query})
    const docs = await this.collection.find(query).toArray()
    return docs
  }

  async findById(id) {
    const o_id = new ObjectID(id)
    const docs = await this.collection.find({"_id": o_id}).toArray()
    return docs
  }
```
### MongoDB
mongo docker images

The following environment variables define the root username, password, and database:
```
MONGO_INITDB_ROOT_USERNAME: root
MONGO_INITDB_ROOT_PASSWORD: example
MONGO_INITDB_DATABASE: banking
```
Obviously this is not secure enough for production, but OK if no access is allowed beyond localhost. 

The volume mapping ```./mongo/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro``` ensures that the mongo/mongo-init.js initialization script is executed for the mongo service. This script seeds the accounts and customer-account collections.

### Mongo Express
Exposed to localhost via port 8080 - http://localhost:8080

### Redis
Used for response caching
Exposed to localhost via port 6379 - http://localhost:6379


