# Check your Wallet

Just another Telegram bot to keep track of your expenses and incomes.
Made years ago, would totally benefit some deep refactoring.

## Features available

- [x] add notes to your expenses/incomes
- [x] divide expenses/incomes by category
- [x] track how you are doing by category, date interval or month
- [x] add emoji reaction to your incomes (useful? not at all)
- [x] handle different currencies

## Couple of screenshots

<details>
<summary>Show more</summary>

![](https://github.com/bragg13/check-your-wallet-bot/blob/master/screenshots/screenshot2.png)

![](https://github.com/bragg13/check-your-wallet-bot/blob/master/screenshots/screenshot1.png)

![](https://github.com/bragg13/check-your-wallet-bot/blob/master/screenshots/screenshot4.png)

![](https://github.com/bragg13/check-your-wallet-bot/blob/master/screenshots/screenshot3.png)

</details>

## Features to be implemented (at some point)

- [-] conversion between currencies
- [-] add expenses/incomes when receiving a bank notification
- [-] monthly recap of your finances
- [-] recurring expenses
- [-] custom categories
- [-] webhooks instead of polling

The project is not under active development.

## How to run

1. Clone the repository

```bash
git clone https://github.com/bragg13/check-your-wallet-bot.git
```

2. Install dependencies

```bash
npm install
```

3. Setup a MongoDB database. You can use a free tier on MongoDB Atlas, or run a local instance with `docker-compose` as following:

```bash
docker-compose -f docker-compose.yaml up
```

Remember to change the user and password in the `docker-compose.yaml` file.

4. Create a bot on Telegram using BotFather and get the token. You can talk to the BotFather on Telegram at the address `@BotFather`.

5. Create a .env file with the following variables:

```
MONGODB_URL="your MongoDB connection string"
BOT_TOKEN="your BotFather token"
```

If you use docker-compose to run the database, the connection string should be something like `mongodb://USR:PSW@localhost:PORT/?directConnection=true`.

4. Run the bot

```bash
npm start
```
