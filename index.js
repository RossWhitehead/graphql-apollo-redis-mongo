'use strict'

const { ApolloServer } = require('apollo-server')
const { RedisCache } = require('apollo-server-cache-redis')
const MongoClient = require('mongodb').MongoClient
const promiseRetry = require('promise-retry')
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

function main() {
  const connectOptions = {
    reconnectTries: 60,
    reconnectInterval: 1000,
    poolSize: 10,
    bufferMaxEntries: 0
  }

  const promiseRetryOptions = {
    retries: connectOptions.reconnectTries,
    factor: 1.5,
    minTimeout: connectOptions.reconnectInterval,
    maxTimeout: 5000
  }
  
  const connect = (url) => {
    return promiseRetry((retry, number) => {
      console.log(`MongoClient connecting to ${url} - retry number: ${number}`)
      return MongoClient.connect(url, connectOptions).catch(retry)
    }, promiseRetryOptions)
  }

  connect(MONGO_URL).then((client) => {
    console.log("Mongo client connected.")
    console.log({client})

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

    server.listen().then(({url}) => {
      console.log(`🚀 Server ready at ${url}`) 
    })
  })
}

main()







