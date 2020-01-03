const { mapAccount, mapCurrentAccount } = require("./mappers")

module.exports = {
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
}