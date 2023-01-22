import {Bot, session} from 'grammy';
import { Keyboard } from 'grammy';
import { MongoDBAdapter } from "@grammyjs/storage-mongodb";
import { MongoClient } from "mongodb";
import { FileAdapter } from '@grammyjs/storage-file';

import { HttpError, GrammyError } from 'grammy';

import pkg_files from "@grammyjs/files";
import pkg_conversation from "@grammyjs/conversations";
const { conversations, createConversation} = pkg_conversation;
const { FileFlavor, hydrateFiles } = pkg_files;

import { Calendar } from "grammy-calendar";
import { currencyHandler,  editHandler, settingsHandler } from './src/handlers.js'
import { expenseHandler } from './src/expense.js'
import { incomeHandler } from './src/income.js'
import { trackHandler } from './src/tracking.js' 

const client = new MongoClient(process.env.MONGODB_URL);
const bot = new Bot(process.env.BOT_TOKEN);

/* mongodb */
await client.connect();
const db = client.db(process.env.MONGODB_DB);
const sessions = db.collection('users');
  
/* session management */
bot.use(session({ initial: () => ({ user : {
    chatid: '',
    username: '',
    lang: '',
    def_currency: 'EUR',
    expenses: [],
    incomes: [],
    settings: {
      // weeklySumup: true,
      monthlySumup: true
    },
    calendarOptions: {} 
  }}),
  storage: new MongoDBAdapter({ collection: sessions })
}));

export const calendarMenu = new Calendar(ctx => ctx.session.calendarOptions);
bot.use(calendarMenu);

bot.use(conversations());
bot.use(createConversation(expenseHandler));
bot.use(createConversation(incomeHandler));
bot.use(createConversation(editHandler));
bot.use(createConversation(currencyHandler));
bot.use(createConversation(trackHandler));
bot.use(createConversation(settingsHandler));
bot.api.config.use(hydrateFiles(process.env.BOT_TOKEN));

/* start commmand - shows welcome/back */
bot.command('start', async ctx => { startHandler(ctx) });

/* commands */
bot.command('expense', async ctx => { await ctx.conversation.enter('expenseHandler') });
bot.command('income', async ctx => { await ctx.conversation.enter('incomeHandler') });
bot.command('currency', async ctx => { await ctx.conversation.enter('currencyHandler') });
bot.command('tracking', async ctx => { await ctx.conversation.enter('trackHandler') });
bot.command('settings', async ctx => { await ctx.conversation.enter('settingsHandler') });
bot.command('edit', async ctx => { await ctx.conversation.enter('editHandler') });

/* buttons */
bot.on('msg:text', async ctx => {
  const txt = ctx.message.text;
  switch (txt) {
    case '🔴 Spent some money! :c 🔴':
      await ctx.conversation.enter('expenseHandler');
      break;

    case '🟢 Found some money! :) 🟢':
      await ctx.conversation.enter('incomeHandler');
      break;

    case `🖋️ Edit my expenses/incomes 🖋️`:
      await ctx.conversation.enter('editHandler');
      break;
    
    case '📈 Show how I am doing 📉':
      await ctx.conversation.enter('trackHandler');
      break;

    case `💱 Change default currency 💱`:
      await ctx.conversation.enter('currencyHandler');
      break;

    case `⚙️ Settings ⚙️`:
      await ctx.conversation.enter('settingsHandler');
      break;

    }
});


bot.start();
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});
console.log('Bot running.')

process.once('SIGINT', () => {
  // TODO: delete session
  bot.stop('SIGINT')
});
process.once('SIGTERM', () => {
  // TODO: delete session
  bot.stop('SIGTERM')
});


/**
 * Conversation handler for /start command.
 * Checks if the user is new, handles their session and asks for the email.
 * @param {Conversation} conversation 
 * @param {Context} ctx 
 */
const startHandler = ctx => {
  if (!ctx.session.user.username | ctx.session.user.username.length==0) {
    // fill in the session
    ctx.session.user.chatid = ctx.message.from.id; 
    ctx.session.user.username = ctx.message.from.username; 
    ctx.session.user.lang = ctx.message.from.language_code;

    ctx.reply(`Hey ${ctx.session.user.username} 👋, welcome to the bot!`, {
      reply_markup: mainKeyboard()
  });
    
  } else {
    ctx.reply(`Hey ${ctx.session.user.username}, 👋 welcome back to the bot!`, {
      reply_markup: mainKeyboard()
  });
    
  }
  

}

export const mainKeyboard = () => {
  const kb = new Keyboard();
  kb.text(`🔴 Spent some money! :c 🔴`).text(`🟢 Found some money! :) 🟢`).row();
  // kb.text(`🖋️ Edit my expenses/incomes 🖋️`).row();
  kb.text(`📈 Show how I am doing 📉`).row();
  kb.text(`💱 Change default currency 💱`).text(`⚙️ Settings ⚙️`).row();
  
  return kb.oneTime();
}

const setupSchedules = () => {
  const months = [
    new Date(2023, 0, 1, 8, 0, 0, 0),
    new Date(2023, 1, 1, 8, 0, 0, 0),
    new Date(2023, 2, 1, 8, 0, 0, 0),
    new Date(2023, 3, 1, 8, 0, 0, 0),

    new Date(2023, 4, 1, 8, 0, 0, 0),
    new Date(2023, 5, 1, 8, 0, 0, 0),
    new Date(2023, 6, 1, 8, 0, 0, 0),
    new Date(2023, 7, 1, 8, 0, 0, 0),

    new Date(2023, 8, 1, 8, 0, 0, 0),
    new Date(2023, 9, 1, 8, 0, 0, 0),
    new Date(2023, 10, 1, 8, 0, 0, 0),
    new Date(2023, 11, 1, 8, 0, 0, 0)
  ];

  // const job = new CronJob(date, function() {
  //   const d = new Date();
  //   console.log('Specific date:', date, ', onTick at:', d);
  // });

}