import {Bot, session} from 'grammy';
import { FileAdapter } from '@grammyjs/storage-file';
import pkg_files from "@grammyjs/files";
import pkg_conversation from "@grammyjs/conversations";
import { Keyboard } from 'grammy';
const { conversations, createConversation} = pkg_conversation;
const { FileFlavor, hydrateFiles } = pkg_files;

import { expenseHandler, incomeHandler, currencyHandler, trackHandler } from './src/handlers.js'
const bot = new Bot(process.env.BOT_TOKEN);

/* session management */
bot.use(session({ initial: () => ({ user : {
    chatid: '',
    username: '',
    lang: '',
    def_currency: 'EUR',
    expenses: [],
    incomes: [] 
  }}),
  storage: new FileAdapter({
    dirName: "sessions",
  })
}));

bot.use(conversations());
bot.use(createConversation(expenseHandler));
bot.use(createConversation(incomeHandler));
bot.use(createConversation(currencyHandler));
bot.use(createConversation(trackHandler));
bot.api.config.use(hydrateFiles(process.env.BOT_TOKEN));

/* start commmand - shows welcome/back */
bot.command('start', async ctx => { startHandler(ctx) });


/* commands */
bot.command('expense', async ctx => { await ctx.conversation.enter('expenseHandler') });
bot.command('income', async ctx => { await ctx.conversation.enter('incomeHandler') });
bot.command('currency', async ctx => { await ctx.conversation.enter('currencyHandler') });
bot.command('tracking', async ctx => { await ctx.conversation.enter('trackHandler') });

/* buttons */
bot.on('msg:text', async ctx => {
  const txt = ctx.message.text;
  switch (txt) {
    case '🔴 💶 Spent some money! :c 💶 🔴':
      await ctx.conversation.enter('expenseHandler');
      break;

    case '🟢 💶 Found some money! :) 💶 🟢':
      await ctx.conversation.enter('incomeHandler');
      break;
    
    case '📈 Show how I am doing 📉':
      await ctx.conversation.enter('trackHandler');
      break;

    case `💱 Change default currency 💱`:
      await ctx.conversation.enter('currencyHandler');
      break;

    }
});


/* === bootstrap === */
bot.start();
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
  kb.text(`🔴 💶 Spent some money! :c 💶 🔴`).row();
  kb.text(`🟢 💶 Found some money! :) 💶 🟢`).row();
  kb.text(`📈 Show how I am doing 📉`).row();
  kb.text(`💱 Change default currency 💱`).row();
  
  return kb.oneTime();
}