import dotenv from 'dotenv';
dotenv.config();
import { Configuration, OpenAIApi } from 'openai';
import { getDatabase, setDatabase } from './database.js';
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);


async function getChatAnswer(serverId, userId, message) {
    let chatDB = await getDatabase('chat');
    if (!chatDB[serverId]) {
        chatDB[serverId] = {};
    }
    if (!chatDB[serverId][userId]) {
        chatDB[serverId][userId] = {
            model: 'gpt-3.5-turbo',
            messages: [
                { "role": "system", "content": "You are a helpful, creative, clever, and very precise." },
            ]
        }
    }

    if (message.toLowerCase() == 'clear' || message.toLowerCase() == ' clear') {
        delete chatDB[serverId][userId]
        await setDatabase('chat', chatDB);
        return ['History cleared!'];
    }

    chatDB[serverId][userId].messages.push({ "role": "user", "content": message });
    const response = await openai.createChatCompletion(chatDB[serverId][userId]);
    chatDB[serverId][userId].messages.push({ "role": "system", "content": response.data.choices[0].message.content });
    await setDatabase('chat', chatDB);

    let answer = response.data.choices[0].message.content;
    if (chatDB[serverId][userId].messages.length > 15) answer = `Note: <@${userId}> Please clear chat, answers are getting expensive. Use \`< clear\`  -@mecs\n\n${answer}`;
    let answerChunks = [];
    while (answer.length > 2000) { // Discord message limit
        answerChunks.push(answer.substring(0, 2000));
        answer = answer.substring(2000);
    }
    answerChunks.push(answer);
    return answerChunks;
}


export { getChatAnswer };