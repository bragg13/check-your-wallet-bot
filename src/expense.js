import { Bot, Context, Keyboard } from "grammy";
import { calendarMenu, mainKeyboard } from "../index.js";
import { formatMoney, sortByDate, currencySymbols } from "./handlers.js";

const expenseKeyboard = (noteDone, categoryDone, dateDone) => {
  const kb = new Keyboard();
  kb.text((noteDone) ? `(✔️) 🗒️ Add some notes...` : `🗒️ Add some notes...`).row();
  kb.text((categoryDone) ? `(✔️) 🏺 Set category...` : `🏺 Set category...`)
    .text((dateDone) ? `(✔️) 📅 Set date...` : `📅 Set date...`).row();
  kb.text(`✅ Done.`).row();

  return kb.oneTime();
}

export const categoryKeyboard = () => {
  let kb = new Keyboard();
  kb.text('🍕 Food').text('🍺 Drinks').row();
  kb.text('🧳 Travel').text('🛍️ Groceries').row();
  kb.text('🪴 Useless things').text('🫠 Custom...').row();

  return kb.oneTime();
};


export async function expenseHandler(conversation, ctx) {
  let expense = {};
  let money, note, category, date;
  let noteDone = false, categoryDone = false, dateDone = false, done = false;
  date = new Date();

  await ctx.reply(`Sad to hear that ${conversation.session.user.username} :c\nHow much did you spend?\n(press 'q' to cancel))`);
  ctx = await conversation.wait();

  // check if it is a number
  while (isNaN(ctx.message.text)) {
    // quit if user types 'q'
    if (ctx.message.text == 'q') {
      await ctx.reply(`Canceling operation...`, {
        reply_markup: mainKeyboard()
      })
      return;
    }

    await ctx.reply(`Are you sure that is a number? (ndr. use dot as separator)`);
    ctx = await conversation.wait();
  }

  // quit if user inputs 0
  if (ctx.message.text == '0') {
    await ctx.reply(`Canceling operation...`, {
      reply_markup: mainKeyboard()
    })
    return;
  }

  // ask to input how much money went spent
  money = formatMoney(ctx.message.text);
  const currencySymbol = currencySymbols[ctx.session.user.def_currency];

  while (!done) {
    // loop to fill out the expense note
    let kb = expenseKeyboard(noteDone, categoryDone, dateDone);

    await ctx.reply((noteDone || categoryDone || dateDone) ? `...only ${money}${currencySymbol}? Don't make it a big deal` : `Only ${money}${currencySymbol}? Don't make it a big deal`, {
      reply_markup: kb
    });

    // what next?
    ctx = await conversation.wait();
    switch (ctx.message.text) {
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

        // custom category
        if (ctx.message.text == '🫠 Custom...') {
          let _msg = `These are your custom categories: `
          for (let c of conversation.session.user.custom_categories) {
            _msg += `\n${c}`
          }
          _msg += `\nType in the name of your custom category:`;

          // inline keyboard o text
          await ctx.reply(_msg);

          ctx = await conversation.wait();

          // add custom category to user session
          if (!(ctx.message.text in conversation.session.user.custom_categories)) {
            conversation.session.user.custom_categories.push(category);
          }
        }
        category = ctx.message.text;
        categoryDone = true;
        break;

      case '(✔️) 📅 Set date...':
      case '📅 Set date...':

        conversation.session.calendarOptions = { defaultDate: new Date() };
        await ctx.reply(`So, WHEN did you spend those ${money}${currencySymbol}?`, {
          reply_markup: calendarMenu
        });
        ctx = await conversation.wait();
        date = ctx.calendarSelectedDate;
        dateDone = true;
        break;

      case '✅ Done.':
        done = true;
        break;

    }

    if (noteDone && categoryDone)
      done = true;
  }

  // set the expense object
  expense['type'] = 'expense';
  expense['money'] = money;
  expense['currency'] = ctx.session.user.def_currency;
  if (noteDone) expense['note'] = note;
  if (categoryDone) expense['category'] = category;
  expense['date'] = date;

  // save to session sorting wallet arra
  conversation.session.user.wallet.push(expense);
  conversation.session.user.wallet = sortByDate(conversation.session.user.wallet);

  await ctx.reply(`➕ Expense added!`, {
    reply_markup: mainKeyboard()
  })
  return;
}
