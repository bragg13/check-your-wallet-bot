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

const trackingKb = () => {
  let kb = new Keyboard();
  kb.text('🧮 Show me the whole expenses/incomes list').row();
  kb.text('🏺 Sort by category').row();
  kb.text('📅 Show the last month').text('⏱️ Show the current month').row();
  kb.text('🔙 Back 🔙').row();

  return kb.oneTime();
}

const currencyKb = () => {
  let kb = new Keyboard();
  kb.text('EUR').text('USD').row();
  kb.text('GBP').text('JPY').row();
  kb.text('AUD').text('CAD').row();
  kb.text('CHF').text('CNH').row();

  return kb.oneTime();
}

const formatMessageEntry = (e, type) => {
  let tmp = '';

  // format date
  let date = new Date(e.date);
  let day = date.getDate(); 
  let month = date.toString().split(' ')[1]; 
  let year = date.getUTCFullYear();
  
  // construct string
  if (type == 'expense') {
    tmp += `💔 Spent ${e.money}${currencySymbols[e.currency]}`;
    if (e['note']) tmp += ` for "${e.note}"`;
    if (e['category']) tmp += ` - ${e.category}`;
  } else {
    tmp = `💚 Got ${e.money}${currencySymbols[e.currency]}`;
    if (e['note']) tmp += ` for "${e.note}"`;
    if (e['happiness']) tmp += ` (you were like: ${e.happiness})`;
  }
  tmp += `\non ${day} ${month} ${year}`;

  return tmp;
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
  expense['date'] = date;

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
    // loop to fill out the income note
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
  income['date'] = date;

  // save to session
  conversation.session.user.incomes.push(income);

  await ctx.reply(`➕ Income added!`, {
    reply_markup: mainKeyboard()
  })
  return;
}

export async function currencyHandler (conversation, ctx) {
  await ctx.reply('Okay, choose a currency from below or type in a custom one:', {
    reply_markup: currencyKb()
  });

  ctx = await conversation.wait();

  // maybe some checks
  let currency = ctx.message.text.substring(0, 3);
  conversation.session.user.def_currency = currency;

  // back
  await ctx.reply(`New currency set!`, {
    reply_markup: mainKeyboard()
  })
  return;
}

export async function trackHandler (conversation, ctx) {
  let done = false;
  let expenses = conversation.session.user.expenses;
  let incomes = conversation.session.user.incomes;
  let message = '';
  let currentDate = new Date();
  
  // dont show menu if no expennses/incomes
  if (expenses.length == 0 || incomes.length == 0) {
    await ctx.reply(`You still haven't added any expenses nor incomes!`, {
      reply_markup: mainKeyboard()
    });  
    return; 
  }

  await ctx.reply(`Okay ${conversation.session.user.username}, let's see how your finances are going`, {
    reply_markup: trackingKb()
  });
  
  while (!done) {
    // loop to menu
    ctx = await conversation.wait();

    switch(ctx.message.text) {
      case '🧮 Show me the whole expenses/incomes list': 
        message = '';
        for (let e of expenses) {
          let tmp = formatMessageEntry(e, 'expense');
          message += tmp;
          message += '\n';
        }

        message += '\n';

        for (let i of incomes) {
          let tmp = formatMessageEntry(i, 'income');
          message += tmp;
          message += '\n';
        }

        await ctx.reply(message, {
          reply_markup: trackingKb()
        });
        break;

      case '🏺 Sort by category': 
        ctx.reply('Which category?', {
          reply_markup: categoryKeyboard()
        });
        ctx = await conversation.wait();
        
        let cat = ctx.message.text;
        let empty = true;
        message = '';

        for (let e of expenses) {
          if (e['category'] && e['category']==cat) {
            let tmp = formatMessageEntry(e, 'expense');
            message += tmp;
            message += '\n';
            empty = false;
          }
        }

        // if there is no entry for this category
        if (empty) message = `Sorry, didn't find any expense for ${cat}!`;
        
        await ctx.reply(message, {
          reply_markup: trackingKb()
        });
        break;

      case '📅 Show the last month': 
        message = '';

        if (currentDate.getMonth() == 0) {
          ctx.reply('Currently not available, the year just began :)', {
            reply_markup: trackingKb()
          })
          break;
        }

        for (let e of expenses) {
          let _date = new Date(e.date);
          if (_date.getMonth() == currentDate.getMonth()-1) {
            let tmp = formatMessageEntry(e, 'expense');
            message += tmp;
            message += '\n';
          }
        }

        message += '\n';

        for (let i of incomes) {
          let _date = new Date(i.date);
          if (_date.getMonth() == currentDate.getMonth()-1) {
            let tmp = formatMessageEntry(i, 'income');
            message += tmp;
            message += '\n';
          }
        }

        await ctx.reply(message, {
          reply_markup: trackingKb()
        });
        break;

      case '⏱️ Show the current month': 
        message = '';

        for (let e of expenses) {
          let _date = new Date(e.date);
          if (_date.getMonth() == currentDate.getMonth()) {
            let tmp = formatMessageEntry(e, 'expense');
            message += tmp;
            message += '\n';
          }
        }

        message += '\n';

        for (let i of incomes) {
          let _date = new Date(i.date);
          if (_date.getMonth() == currentDate.getMonth()) {
            let tmp = formatMessageEntry(i, 'income');
            message += tmp;
            message += '\n';
          }
        }

        await ctx.reply(message, {
          reply_markup: trackingKb()
        });
        break;
        
      case '🔙 Back 🔙':
        done = true;
        break;

    }
  } 

  // back
  await ctx.reply(`Back to main menu...`, {
    reply_markup: mainKeyboard()
  })
  return;
}