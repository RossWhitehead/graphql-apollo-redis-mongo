db.createUser(
  {
      user: "app-user",
      pwd: "password",
      roles: [
          {
              role: "readWrite",
              db: "banking"
          }
      ]
  }
);
db = db.getSiblingDB('banking');
db["accounts"].drop();
db["accounts"].insertMany([
  {
    "accountId": 1,
    "accountType": "Personal",
    "accountSubType": "Current Account",
    "description": "The perfect account for your everyday needs"
  },
  {
    "accountId": 2,
    "accountType": "Personal",
    "accountSubType": "Savings Account",
    "description": "Squirrel away for a rainy day"
  }
]);
db["customer-accounts"].drop();
db["customer-accounts"].insertMany([
  {
    "customerId": 1,
    "identification": "12345678",
    "accountId": 1,
    "balance": 123.45
  },
  {
    "customerId": 1,
    "identification": "87654321",
    "accountId": 2,
    "balance": 56784.56
  },
  {
    "customerId": 2,
    "identification": "45678765",
    "accountId": 1,
    "balance": 70.87
  }
]);