# Check your Wallet

Just another Telegram bot to keep track of your expenses and incomes.
Made more than a year ago, would totally benefit some deep refactoring.


## Features available
- add notes to your expenses/incomes
- divide expenses/incomes by category
- track how you are doing by category, date interval or month
- add emoji reaction to your incomes (useful? not at all)
- handle different currencies
  
## Features to be implemented (at some point)
- conversion between currencies
- add expenses/incomes when receiving a bank notification
- monthly recap of your finances
- recurring expenses
- custom categories 

The project is not under active development.

## How to run
1. Clone the repository
2. Install dependencies
```bash
npm install
```
3. Create a .env file with the following variables:
```
MONGODB_URL - your MongoDB connection string
BOT_TOKEN - your BotFather token
```
4. Run the bot
```bash
npm start
```
