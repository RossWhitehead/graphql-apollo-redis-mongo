const { DataSource } = require('apollo-datasource')
const assert = require('assert')
const ObjectID  = require('mongodb').ObjectID

class MongoDBDataSource extends DataSource {

  constructor(collection){
    assert.strictEqual(typeof collection, 'object')
    super()
    this.collection = collection
  }

  initialize(config) {
    this.context = config.context
  }

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
}

module.exports = MongoDBDataSource
