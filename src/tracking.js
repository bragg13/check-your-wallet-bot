import { calendarMenu, mainKeyboard } from "../index.js";
import { Bot, Context, Keyboard } from "grammy";
import {
  formatMoney,
  sortByDate,
  currencySymbols,
  months,
} from "./handlers.js";
import { categoryKeyboard } from "./expense.js";

const trackingKb = () => {
  let kb = new Keyboard();
  kb.text("🧮 Sort by type").text("🏺 Sort expense by category").row();
  kb.text("⌛ Show in chronological order").row();
  kb.text("📅 Sort by month").text("⏱️ Sort by date").row();
  kb.text("🔙 Back 🔙").row();
  kb.is_persistent = false;
  return kb.oneTime();
};

const formatMessageEntry = (e, type) => {
  let tmp = "";

  // format date
  let date = new Date(e.date);
  let day = date.getDate();
  let month = date.toString().split(" ")[1];
  let year = date.getUTCFullYear();

  // construct string
  if (type == "expense") {
    tmp += `💔 Spent ${e.money}${currencySymbols[e.currency]}`;
    if (e["note"]) tmp += ` for "${e.note}"`;
    if (e["category"]) tmp += ` - ${e.category}`;
  } else {
    tmp = `💚 Got ${e.money}${currencySymbols[e.currency]}`;
    if (e["note"]) tmp += ` for "${e.note}"`;
    if (e["happiness"]) tmp += ` (you were like: ${e.happiness})`;
  }
  tmp += `\non ${day} ${month} ${year}`;

  return tmp;
};

export async function trackHandler(conversation, ctx) {
  let done = false;
  let wallet = conversation.session.user.wallet;
  let expenses = wallet.filter((el) => el.type == "expense");
  let incomes = wallet.filter((el) => el.type == "income");
  let message = "";
  let currentDate = new Date();
  let fromDate = null,
    toDate = null;
  let totExp = 0,
    totInc = 0,
    totLeft = 0;
  let empty;
  let currency = currencySymbols[conversation.session.user.def_currency];

  // dont show menu if no expenses/incomes
  if (expenses.length == 0 && incomes.length == 0) {
    await ctx.reply(`You still haven't added any expenses nor incomes!`, {
      reply_markup: mainKeyboard(),
    });
    return;
  }

  await ctx.reply(
    `Okay ${conversation.session.user.username}, let's see how your finances are going`,
    {
      reply_markup: trackingKb(),
    }
  );

  while (!done) {
    // loop to menu
    ctx = await conversation.wait();

    switch (ctx.message.text) {
      case "🧮 Sort by type":
        message = "";
        for (let e of expenses) {
          let tmp = formatMessageEntry(e, "expense");
          totExp += parseFloat(e.money);
          message += tmp;
          message += "\n";
        }

        message += "\n";

        for (let i of incomes) {
          let tmp = formatMessageEntry(i, "income");
          totInc += parseFloat(i.money);
          message += tmp;
          message += "\n";
        }

        totLeft = totInc - totExp;
        message += `\n😵‍💫 You spent a total of ${formatMoney(
          totExp
        )}${currency}\n💯 You got a total of ${formatMoney(
          totInc
        )}${currency}`;
        message +=
          totLeft > 0
            ? `\n🤑 You are ${formatMoney(totLeft)}${currency} richer!`
            : `\n😭 You are ${formatMoney(totLeft)}${currency} poorer!`;
        totLeft = 0;
        totExp = 0;
        totInc = 0;

        await ctx.reply(message, {
          reply_markup: trackingKb(),
        });
        break;

      case "🏺 Sort expense by category":
        ctx.reply("Which category?", {
          reply_markup: categoryKeyboard(),
        });
        ctx = await conversation.wait();

        let cat = ctx.message.text;

        while (cat == "🫠 Custom...") {
          let _msg = `These are your custom categories: `;
          for (let c of conversation.session.user.custom_categories) {
            _msg += `\n${c}`;
          }

          await ctx.reply(_msg);
          cat =
            ctx.message.text in conversation.session.user.custom_categories
              ? ctx.message.text
              : "🫠 Custom...";
        }

        empty = true;
        message = "";

        for (let e of expenses) {
          if (e["category"] && e["category"] == cat) {
            let tmp = formatMessageEntry(e, "expense");
            message += tmp;
            message += "\n";
            totExp += parseFloat(e.money);
            empty = false;
          }
        }

        message = empty
          ? `Sorry, didn't find any expense for ${cat}!`
          : message +
            `\n😵‍💫 You spent a total of ${formatMoney(
              totExp
            )}${currency} in ${cat}!`;
        totExp = 0;
        empty = true;

        await ctx.reply(message, {
          reply_markup: trackingKb(),
        });
        break;

      case "⌛ Show in chronological order":
        message = "";

        for (let i of wallet) {
          let tmp = formatMessageEntry(i, i.type);
          if (i.type == "expense") totExp += parseFloat(i.money);
          if (i.type == "income") totInc += parseFloat(i.money);
          message += tmp;
          message += "\n";
        }

        message += "\n";

        totLeft = totInc - totExp;
        message += `\n😵‍💫 You spent a total of ${formatMoney(
          totExp
        )}${currency}\n💯 You got a total of ${formatMoney(totInc)}${currency}`;
        message +=
          totLeft > 0
            ? `\n🤑 You are ${formatMoney(totLeft)}${currency} richer!`
            : `\n😭 You are ${formatMoney(totLeft)}${currency} poorer!`;
        totLeft = 0;
        totExp = 0;
        totInc = 0;

        await ctx.reply(message, {
          reply_markup: trackingKb(),
        });
        break;

      case "📅 Sort by month":
        message = "";
        let _months = {};

        // mapping each element to a list related to that month
        for (let el of wallet) {
          if (!(el.date.getMonth().toString() in _months)) {
            _months[el.date.getMonth().toString()] = [];
          }
          _months[el.date.getMonth().toString()].push(el);
        }

        for (let month in _months) {
          message += `${months[month]}:\n`; // add month name to message

          for (let el of _months[month]) {
            let tmp = formatMessageEntry(el, el.type);
            if (el.type == "expense") totExp += parseFloat(el.money);
            if (el.type == "income") totInc += parseFloat(el.money);
            message += tmp;
            message += "\n";
          }
        }

        message += "\n";

        totLeft = totInc - totExp;
        message += `\n😵‍💫 You spent a total of ${formatMoney(
          totExp
        )}${currency}\n💯 You got a total of ${formatMoney(totInc)}${currency}`;
        message +=
          totLeft > 0
            ? `\n🤑 You are ${formatMoney(totLeft)}${currency} richer!`
            : `\n😭 You are ${formatMoney(totLeft)}${currency} poorer!`;
        totExp = 0;
        totInc = 0;
        totLeft = 0;

        await ctx.reply(message, {
          reply_markup: trackingKb(),
        });
        break;

      case "⏱️ Sort by date":
        message = "";

        // faccio selezionare due date all'utente
        conversation.session.calendarOptions = { defaultDate: new Date() };
        ctx.reply("Looking for expenses and incomes between...", {
          reply_markup: calendarMenu,
        });
        ctx = await conversation.wait();
        fromDate = ctx.calendarSelectedDate;

        ctx.reply("... and ....", {
          reply_markup: calendarMenu,
        });
        ctx = await conversation.wait();
        toDate = ctx.calendarSelectedDate;

        // guardo per ogni spesa che la data sia li in mezzo
        let formattedFromDate = ``,
          formattedToDate = ``;
        formattedFromDate = `${fromDate.getDate()} ${
          fromDate.toString().split(" ")[1]
        } ${fromDate.getUTCFullYear()}`;
        formattedToDate = `${toDate.getDate()} ${
          toDate.toString().split(" ")[1]
        } ${toDate.getUTCFullYear()}`;

        message += `Expenses and incomes between ${formattedFromDate} and ${formattedToDate}:\n`;
        empty = true;
        for (let i of wallet) {
          if (i.date >= fromDate && i.date <= toDate) {
            empty = false;
            let tmp = formatMessageEntry(i, i.type);
            if (i.type == "expense") totExp += parseFloat(i.money);
            if (i.type == "income") totInc += parseFloat(i.money);
            message += tmp;
            message += "\n";
          }
        }

        totLeft = totInc - totExp;
        message = empty
          ? `You have no expenses nor incomes between ${formattedFromDate} and ${formattedToDate}`
          : message +
            `\n😵‍💫 You spent a total of ${formatMoney(
              totExp
            )}${currency}\n💯 You got a total of ${formatMoney(
              totInc
            )}${currency}`;

        message += empty
          ? totLeft > 0
            ? `\n🤑 You are ${formatMoney(totLeft)}${currency} richer!`
            : `\n😭 You are ${formatMoney(totLeft)}${currency} poorer!`
          : "";
        totExp = 0;
        totInc = 0;
        totLeft = 0;
        empty = true;

        await ctx.reply(message, {
          reply_markup: trackingKb(),
        });
        break;

      case "🔙 Back 🔙":
        done = true;
        break;
    }
  }

  // back
  await ctx.reply(`Back to main menu...`, {
    reply_markup: mainKeyboard(),
  });
  return;
}
