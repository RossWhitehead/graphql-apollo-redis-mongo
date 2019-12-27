const { DataSource } = require('apollo-datasource')
const assert = require('assert')

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
    const docs = await this.collection.find(query).toArray()
    return docs
  }
}

module.exports = MongoDBDataSource
