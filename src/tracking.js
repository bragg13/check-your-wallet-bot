import { calendarMenu, mainKeyboard } from "../index.js";
import { Bot, Context, Keyboard } from "grammy";
import { formatMoney, sortByDate, currencySymbols } from "./handlers.js";

const trackingKb = () => {
  let kb = new Keyboard();
  kb.text('🧮 Sort by type').text('🏺 Sort by category').row();
  kb.text('⌛ Show in chronological order').row();
  kb.text('📅 Show the last month').text('⏱️ Show the current month').row();
  kb.text('🔙 Back 🔙').row();

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


export async function trackHandler(conversation, ctx) {
  let done = false;
  let expenses = conversation.session.user.expenses;
  let incomes = conversation.session.user.incomes;
  let message = '';
  let currentDate = new Date();
  let totExp = 0, totInc = 0;
  let currency = currencySymbols[conversation.session.user.def_currency];

  // dont show menu if no expenses/incomes
  if (expenses.length == 0 && incomes.length == 0) {
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

    switch (ctx.message.text) {
      case '🧮 Sort by type':
        message = '';
        for (let e of expenses) {
          let tmp = formatMessageEntry(e, 'expense');
          totExp += parseFloat(e.money);
          message += tmp;
          message += '\n';
        }

        message += '\n';

        for (let i of incomes) {
          let tmp = formatMessageEntry(i, 'income');
          totInc += parseFloat(i.money);
          message += tmp;
          message += '\n';
        }

        message += `\n\n😵‍💫 You spent a total of ${formatMoney(totExp)}${currency}\n💯 You got a total of ${formatMoney(totInc)}${currency}`
        totExp = 0;
        totInc = 0;

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
          if (e['category'] && e['category'] == cat) {
            let tmp = formatMessageEntry(e, 'expense');
            message += tmp;
            message += '\n';
            totExp += parseFloat(e.money);
            empty = false;
          }
        }
        message += `\n\n😵‍💫 You spent a total of ${formatMoney(totExp)}${currency} in ${cat}!`
        totExp = 0;

        // if there is no entry for this category
        if (empty) message = `Sorry, didn't find any expense for ${cat}!`;

        await ctx.reply(message, {
          reply_markup: trackingKb()
        });
        break;

      case '⌛ Show in chronological order':
        message = '';
        let merged = expenses.concat(incomes);
        merged = sortByDate(merged);

        for (let i of merged) {
          let tmp = formatMessageEntry(i, i.type);
          if (i.type == 'expense')
            totExp += parseFloat(i.money);
          if (i.type == 'income')
            totInc += parseFloat(i.money);
          message += tmp;
          message += '\n';
        }

        message += '\n';


        message += `\n\n😵‍💫 You spent a total of ${formatMoney(totExp)}${currency}\n💯 You got a total of ${formatMoney(totInc)}${currency}`
        totExp = 0;
        totInc = 0;

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
          if (_date.getMonth() == currentDate.getMonth() - 1) {
            let tmp = formatMessageEntry(e, 'expense');
            message += tmp;
            message += '\n';
            totExp += parseFloat(e.money);
          }
        }

        message += '\n';

        for (let i of incomes) {
          let _date = new Date(i.date);
          if (_date.getMonth() == currentDate.getMonth() - 1) {
            let tmp = formatMessageEntry(i, 'income');
            message += tmp;
            message += '\n';
            totInc += parseFloat(i.money);
          }
        }
        message += `\n\n😵‍💫 You spent a total of ${formatMoney(totExp)}${currency}\n💯 You got a total of ${formatMoney(totInc)}${currency}`
        totExp = 0;
        totInc = 0;

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
            totExp += parseFloat(e.money);
          }
        }

        message += '\n';

        for (let i of incomes) {
          let _date = new Date(i.date);
          if (_date.getMonth() == currentDate.getMonth()) {
            let tmp = formatMessageEntry(i, 'income');
            message += tmp;
            message += '\n';
            totInc += parseFloat(i.money);
          }
        }
        message += `\n\n😵‍💫 You spent a total of ${formatMoney(totExp)}${currency}\n💯 You got a total of ${formatMoney(totInc)}${currency}`
        totExp = 0;
        totInc = 0;

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