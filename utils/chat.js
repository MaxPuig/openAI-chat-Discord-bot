import dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';
import { getDatabase, setDatabase } from './database.js';
const openai = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'], });

const default_system_message = [{ "role": "system", "content": "You are a helpful and straight to the point AI. Use markdown syntax when needed." }];

async function getChatAnswer(serverId, userId, message) {
    let chatDB = await getDatabase('chat');
    if (!chatDB[serverId]) {
        chatDB[serverId] = {};
    }
    if (!chatDB[serverId][userId]) {
        chatDB[serverId][userId] = {
            content: {
                model: 'gpt-3.5-turbo',
                messages: default_system_message,
            },
            history: []
        };
    }

    if (message.toLowerCase() == 'clear' || message.toLowerCase() == ' clear') {
        if (chatDB[serverId][userId].content.messages.length <= 1) return ['Nothing to clear!'];
        chatDB[serverId][userId].history.push(chatDB[serverId][userId].content.messages);
        chatDB[serverId][userId].content.messages = default_system_message;
        await setDatabase('chat', chatDB);
        return ['History cleared!'];
    }
    chatDB[serverId][userId].thinking = true;
    await setDatabase('chat', chatDB);
    chatDB[serverId][userId].content.messages.push({ "role": "user", "content": message });
    const response = await openai.chat.completions.create(chatDB[serverId][userId].content);
    chatDB[serverId][userId].thinking = false;
    chatDB[serverId][userId].content.messages.push({ "role": "system", "content": response.choices[0].message.content });
    await setDatabase('chat', chatDB);

    let answer = response.choices[0].message.content;
    if (chatDB[serverId][userId].content.messages.length > 15) {
        answer = '```Note: Please clear chat, answers are getting expensive\n' +
            'Your conversation is ' + chatDB[serverId][userId].content.messages.length + ' messages long.\n' +
            'Use: "<clear"\n```\n' + answer;
    }
    let answerChunks = [];
    while (answer.length > 2000) { // Discord message limit
        answerChunks.push(answer.substring(0, 2000));
        answer = answer.substring(2000);
    }
    answerChunks.push(answer);
    return answerChunks;
}


export { getChatAnswer };