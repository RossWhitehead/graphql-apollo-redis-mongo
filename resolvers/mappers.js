module.exports.mapAccount = (source) => {
  return {
    id: source._id,
    accountId: source.accountId,
    accountType: source.accountType,
    accountSubType: source.accountSubType,
    description: source.description
  }
}

module.exports.mapCurrentAccount = (source) => {
  return {
    id: source._id,
    customerId: source.customerId,
    identification: source.identification,
    accountId: source.accountId,
    account: null,
    balance: source.balance
  }
}
