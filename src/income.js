import { Bot, Context, Keyboard } from "grammy";
import { calendarMenu, mainKeyboard } from "../index.js";
import { formatMoney, sortByDate, currencySymbols } from "./handlers.js";

const incomeKeyboard = (noteDone, happinessDone, dateDone) => {
  const kb = new Keyboard();
  kb.text((noteDone) ? `(✔️) 🗒️ Add some notes...` : `🗒️ Add some notes...`).row();
  kb.text((happinessDone) ? `(✔️) 😀 How happy are you?` : `😀 How happy are you?`)
    .text((dateDone) ? `(✔️) 📅 Set date...` : `📅 Set date...`).row();
  kb.text(`✅ Done.`).row();

  return kb.oneTime();
}

const emojiKb = () => {
  let kb = new Keyboard();
  kb.text('🫠').text('😊').text('😲').row();
  kb.text('😍').text('🤑').text('😱').row();
  kb.text('😏').text('🤧').text('😫').row();

  return kb.oneTime();
}


export async function incomeHandler(conversation, ctx) {
  let income = {};
  let money, note, happiness, date;
  let noteDone = false, happinessDone = false, dateDone = false, done = false;
  date = new Date();

  await ctx.reply(`That's great ${conversation.session.user.username}!\nHow much are we talking about?`);
  ctx = await conversation.wait();

  // check if it is a number
  while (isNaN(ctx.message.text)) {
    await ctx.reply(`Are you sure that is a number? (ndr. use dot as separator)`);
    ctx = await conversation.wait();
  }

  // ask to input how much money went spent
  money = formatMoney(ctx.message.text);
  const currencySymbol = currencySymbols[ctx.session.user.def_currency];

  while (!done) {
    // loop to fill out the income note
    let kb = incomeKeyboard(noteDone, happinessDone, dateDone);

    await ctx.reply((noteDone || happinessDone || dateDone) ? `I mean, ${money}${currencySymbol} is still something...` : `I mean, ${money}${currencySymbol} is still something...`, {
      reply_markup: kb
    });

    // what next?
    ctx = await conversation.wait();
    switch (ctx.message.text) {
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

      case '(✔️) 📅 Set date...':
      case '📅 Set date...':

        conversation.session.calendarOptions = { defaultDate: new Date() };
        await ctx.reply(`So, WHEN did you get those ${money}${currencySymbol}?`, {
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

    if (noteDone && happinessDone)
      done = true;
  }

  // set the expense object
  income['type'] = 'income';
  income['money'] = money;
  income['currency'] = ctx.session.user.def_currency;
  if (noteDone) income['note'] = note;
  if (happinessDone) income['happiness'] = happiness;
  income['date'] = date;

  // save to session
  conversation.session.user.incomes.push(income);

  let sorted = sortByDate(conversation.session.user.incomes);

  conversation.session.user.incomes = sorted;

  await ctx.reply(`➕ Income added!`, {
    reply_markup: mainKeyboard()
  })
  return;
}