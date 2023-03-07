import dotenv from 'dotenv';
dotenv.config();
import { getChatAnswer } from './utils/chat.js';
import { Client, GatewayIntentBits, Partials } from 'discord.js';


const client = new Client({
    partials: [Partials.Message],
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages]
});


client.on('ready', async function () {
    console.log('Bot started!');

});


client.on('messageCreate', async function (message) {
    if (message.author.bot) return;
    if (message.content.startsWith('<')) {
        const message_user = message.content.substring(1);
        await message.channel.sendTyping();
        let chatAnswer = await getChatAnswer(message.guild.id, message.author.id, message_user);
        for (let i = 0; i < chatAnswer.length; i++) {
            await message.channel.sendTyping();
            if (i == 0) {
                await message.reply(chatAnswer[i]);
            } else {
                await message.channel.send(chatAnswer[i]);
            }
        }
    }
});


client.login(process.env.TOKEN);