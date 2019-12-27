'use strict'

const { ApolloServer } = require('apollo-server')
const { RedisCache } = require('apollo-server-cache-redis')
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()

const MongoDBDataSource = require('./datasources/mongodb-datasource')
const resolvers = require('./resolvers/resolvers')
const typeDefs = require('./schemas/schema')

const {
  MONGO_URL,
  MONGO_DB,
  MONGO_ACCOUNTS,
  MONGO_CUSTOMER_ACCOUNTS,
  REDIS_HOST
} = process.env

async function main() {
  const client = new MongoClient(MONGO_URL)

  try {
    await client.connect()
    console.log(`Connected to ${MONGO_URL}`)

    const db = client.db(MONGO_DB)
    const accountsCollection = db.collection(MONGO_ACCOUNTS)
    const customerAccountsCollection = db.collection(MONGO_CUSTOMER_ACCOUNTS)

    const context = () => ({
      accountsDataSource: new MongoDBDataSource(accountsCollection),
      customerAccountsDataSource: new MongoDBDataSource(customerAccountsCollection)
    })

    const server = new ApolloServer({ 
      typeDefs,
      resolvers,  
      cache: new RedisCache({
        host: REDIS_HOST,
      }),
      context
    })
  
    server.listen().then(({ MONGO_URL }) => {
      console.log(`🚀 Server ready at ${MONGO_URL}`) 
    })
  } catch (err) {
    console.log(err.stack)
  }
  client.close()
}

main()







