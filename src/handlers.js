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

const emojiKb = () => {
  let kb = new Keyboard();
  kb.text('🫠').text('😊').text('😲').row();
  kb.text('😍').text('🤑').text('😱').row();
  kb.text('😏').text('🤧').text('😫').row();

  return kb.oneTime();
}

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
      case '(✔️) 🗒️ Add some notes...':
      case '🗒️ Add some notes...':
        // ask to input some text
        await ctx.reply(`So, WHY did you spend those ${money}${currencySymbol}?`);
        ctx = await conversation.wait();
        
        note = ctx.message.text;
        noteDone = true;
        break;
         
      case '(✔️) 🏺 Set category...':
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
  expense['date'] = date.toUTCString();

  // save to session
  conversation.session.user.expenses.push(expense);

  await ctx.reply(`➕ Expense added!`, {
    reply_markup: mainKeyboard()
  })
  return;
}


export async function incomeHandler (conversation, ctx) {
  let income = {};
  let money, note, happiness, date;
  let noteDone = false, happinessDone = false, done = false;
  date = new Date();

  await ctx.reply(`That's great ${conversation.session.user.username}!\nHow much are we talking about?`);
  ctx = await conversation.wait();
  
  // ask to input how much money went spent
  money = ctx.message.text;
  const currencySymbol = currencySymbols[ctx.session.user.def_currency];

  while (!done) {
    // loop to fill out the expense note
    const kb = new Keyboard();
    kb.text( (noteDone) ? `(✔️) 🗒️ Add some notes...` : `🗒️ Add some notes...`).row();
    kb.text( (happinessDone) ? `(✔️) 😀 How happy are you?` : `😀 How happy are you?`).row();
    kb.text(`✅ Done.`).row();
    kb.oneTime();
  
    await ctx.reply((noteDone || happinessDone) ? `I mean, ${money}${currencySymbol} is still something...` : `I mean, ${money}${currencySymbol} is still something...`, {
      reply_markup: kb
    });
  
    // what next?
    ctx = await conversation.wait();
    switch(ctx.message.text) {
      case '(✔️) 🗒️ Add some notes...':
      case '🗒️ Add some notes...':
        // ask to input some text
        await ctx.reply(`So, where did you get these ${money}${currencySymbol} from?`);
        ctx = await conversation.wait();
        
        note = ctx.message.text;
        noteDone = true;
        break;

      case '(✔️) 😀 How happy are you?':
      case '😀 How happy are you?':
        // ask to input some text
        await ctx.reply(`Tell me how happy you are with an emoji or choose one from below`, {
          reply_markup: emojiKb()
        });
        ctx = await conversation.wait();
        
        happiness = ctx.message.text;
        happinessDone = true;
        break;

      case '✅ Done.':
        done = true;
        break;

    }

    if (noteDone && happinessDone)
      done = true;
  }

  // set the expense object
  income['money'] = money;
  income['currency'] = ctx.session.user.def_currency;
  if (noteDone) income['note'] = note;
  if (happinessDone) income['happiness'] = happiness;
  income['date'] = date.toUTCString();

  // save to session
  conversation.session.user.incomes.push(income);

  await ctx.reply(`➕ Income added!`, {
    reply_markup: mainKeyboard()
  })
  return;
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