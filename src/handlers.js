import { Bot, Context, Keyboard } from "grammy";
import { calendarMenu, mainKeyboard } from "../index.js";

export const currencySymbols = {
  'EUR': '€',
  'USD': '$',
  'JPY': '¥',
  'GBP': '£',
  'AUD': '$',
  'CAD': '$',
  'CHF': '₣',
  'CNH': '¥'
};

export const months = {
  0: 'January',
  1: 'February',
  2: 'March',
  3: 'April',
  4: 'May',
  5: 'June',
  6: 'July',
  7: 'August',
  8: 'September',
  9: 'October',
  10: 'November',
  11: 'December'
};

const settingsKb = (settings) => {
  let kb = new Keyboard();
  kb.text(settings.monthlySumup ? '🔕 Set monthly sum-up off' : '🔔 Set monthly sum-up on').row();
  kb.text('❌ Delete my data').row();
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

export const sortByDate = (array) => {
  let _array = array.sort((a, b) => a.date - b.date);
  return _array;
}

export const formatMoney = money => {
  let _money = money.toString().split('.');

  return (_money.length == 1)
    ? money                                       // no digits after dot, return
    : (_money[1].length == 1)
      ? `${_money[0]}.${_money[1]}0`              // one digit after dot, add a 0
      : money                                     // two digits after dot, return
}

const deleteData = (conversation) => {
  conversation.session.user = {
    chatid: '',
    username: '',
    lang: '',
    def_currency: 'EUR',
    expenses: [],
    incomes: [],
    settings: {
      monthlySumup: true
    }
  };

  console.log('tbd');
}

export async function currencyHandler(conversation, ctx) {
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

export async function settingsHandler(conversation, ctx) {
  let done = false;
  let curr;
  const yesnoKb = new Keyboard();
  yesnoKb.text('YES!').row();
  yesnoKb.text('Oops wrong button').row();
  yesnoKb.oneTime();

  let settings = conversation.session.user.settings;

  await ctx.reply(`Select an option:`, {
    reply_markup: settingsKb(settings)
  });

  while (!done) {
    // loop to menu
    ctx = await conversation.wait();

    switch (ctx.message.text) {
      case '🔕 Set monthly sum-up off':
      case '🔔 Set monthly sum-up on':
        curr = conversation.session.user.settings.monthlySumup;
        conversation.session.user.settings.monthlySumup = !curr;

        await ctx.reply(`Select an option:`, {
          reply_markup: settingsKb(settings)
        });

      case '❌ Delete my data':
        await ctx.reply(`Are you sure you want to delete all your data?`, {
          reply_markup: yesnoKb
        })

        ctx = await conversation.wait();

        if (ctx.message.text == 'YES!') {
          deleteData(conversation);
          await ctx.reply(`Data successfully deleted!`);
          done = true;

        } else {
          await ctx.reply(`Happens all the time.`, {
            reply_markup: settingsKb(settings)
          });

        }
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

export async function editHandler(conversation, ctx) {
  return;
}