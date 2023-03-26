import dotenv from 'dotenv';
dotenv.config();
import { getChatAnswer } from './utils/chat.js';
import { Client, GatewayIntentBits, Partials, Events, ButtonStyle } from 'discord.js';


const client = new Client({
    partials: [Partials.Message],
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages]
});


client.on('ready', async function () {
    console.log('Bot started!');

});


client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;
    const regex = /^<@\d{17,19}>/; // Regex to match a mention
    if (message.content.match(regex)) return; // If the message is a mention, ignore it.
    if (message.content.startsWith('<')) {
        const message_user = message.content.substring(1);
        await message.channel.sendTyping();
        let chatAnswer = await getChatAnswer(message.guild.id, message.author.id, message_user);
        for (let i = 0; i < chatAnswer.length; i++) {
            await message.channel.sendTyping();
            if (i == 0) {
                if (chatAnswer.length == 1) {
                    await message.reply({
                        content: chatAnswer[i],
                        components: [{ type: 1, components: [{ type: 2, style: ButtonStyle.Danger, label: '<clear', customId: 'clear' }] }]
                    });
                } else {
                    await message.reply(chatAnswer[i]);
                }
            } else {
                if (i == chatAnswer.length - 1) { // Last chunk
                    await message.channel.send({
                        content: chatAnswer[i],
                        components: [{ type: 1, components: [{ type: 2, style: ButtonStyle.Danger, label: '<clear', customId: 'clear' }] }]
                    });
                } else {
                    await message.channel.send(chatAnswer[i]);
                }
            }
        }
    }
});


client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isButton()) {
        if (interaction.customId == 'clear') {
            let chatAnswer = await getChatAnswer(interaction.guild.id, interaction.user.id, 'clear');
            await interaction.reply({ content: `<@${interaction.user.id}> ` + chatAnswer[0], components: [] });
        }
    }
});


client.login(process.env.TOKEN);