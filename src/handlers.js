import { Context, Keyboard } from "grammy";
import { mainKeyboard } from "../index.js";
const currencySymbols = {
  'EUR': '€',
  'USD': '$',
  'JPY': '¥',
  'GBP': '£',
  'AUD': '$',
  'CAD': '$',
  'CHF': '₣',
  'CNH': '¥'
};

const categoryKeyboard = () => {
  let kb = new Keyboard();
  kb.text('🍕 Food').text('🍺 Drinks').row();
  kb.text('🧳 Travel').text('🛍️ Groceries').row();
  kb.text('🪴 Useless things').text('🫠 Other').row();

  return kb.oneTime();
};

export async function expenseHandler (conversation, ctx) {
  let expense = {};
  let money, note, category, date;
  let noteDone = false, categoryDone = false, done = false;
  date = new Date();

  await ctx.reply(`Sad to hear that ${conversation.session.user.username} :c\nHow much did you spend?`);
  ctx = await conversation.wait();
  
  // ask to input how much money went spent
  money = ctx.message.text;
  const currencySymbol = currencySymbols[ctx.session.user.def_currency];

  while (!done) {
    // loop to fill out the expense note
    const kb = new Keyboard();
    kb.text( (noteDone) ? `(✔️) 🗒️ Add some notes...` : `🗒️ Add some notes...`).row();
    kb.text( (categoryDone) ? `(✔️) 🏺 Set category...` : `🏺 Set category...`).row();
    kb.text(`✅ Done.`).row();
    kb.oneTime();
  
    await ctx.reply((noteDone || categoryDone) ? `...only ${money}${currencySymbol}? Don't make it a big deal` : `Only ${money}${currencySymbol}? Don't make it a big deal`, {
      reply_markup: kb
    });
  
    // what next?
    ctx = await conversation.wait();
    switch(ctx.message.text) {
      case '🗒️ Add some notes...':
        // ask to input some text
        await ctx.reply(`So, WHY did you spend those ${money}${currencySymbol}?`);
        ctx = await conversation.wait();
        
        note = ctx.message.text;
        noteDone = true;
        break;

      case '🏺 Set category...':
        // ask to input some text
        await ctx.reply(`So, HOW did you spend those ${money}${currencySymbol}?`, {
          reply_markup: categoryKeyboard()
        });
        ctx = await conversation.wait();
        
        category = ctx.message.text;
        categoryDone = true;
        break;

      case '✅ Done.':
        done = true;
        break;

    }

    if (noteDone && categoryDone)
      done = true;
  }

  // set the expense object
  expense['money'] = money;
  expense['currency'] = ctx.session.user.def_currency;
  if (noteDone) expense['note'] = note;
  if (categoryDone) expense['category'] = category;
  expense['date'] = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;

  // save to session
  conversation.session.user.expenses.push(expense);

  await ctx.reply(`➕ Expense added!`, {
    reply_markup: mainKeyboard()
  })
  return;
}

export async function incomeHandler (conversation, ctx) {
  await ctx.reply('Send me the document, I\'ll wait :)');
  ctx = await conversation.wait();
}

export async function currencyHandler (conversation, ctx) {
  // const currencySymbol = 
  await ctx.reply('WIP');
  return;
  // ctx = await conversation.wait();
}

export async function trackHandler (conversation, ctx) {
  await ctx.reply('Send me the document, I\'ll wait :)');
  ctx = await conversation.wait();
}