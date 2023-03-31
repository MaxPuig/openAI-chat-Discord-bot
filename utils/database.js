import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
const db = new Low(new JSONFile('./data/database.json'));


await db.read();
if (db.data === null) { // If the database doesn't exist, create it.
    db.data = {
        'chat': {
            'serverId': {
                'userId': {
                    'thinking': 'false',
                    'content': {
                        'model': 'gpt-3.5-turbo',
                        'messages': [
                            { 'role': 'system', 'content': 'You are an AI...' },
                            { 'role': 'user', 'content': 'Who are you?' }
                        ],
                    },
                    'history': [
                        [
                            { 'role': 'system', 'content': 'you are...' },
                            { 'role': 'user', 'content': 'Who are you?' }
                        ]
                    ]
                }
            }
        }
    }
    await db.write();
}


/** Returns the object or array. */
async function getDatabase(part) {
    await db.read();
    return db.data[part];
}


/** Save the object or array. */
async function setDatabase(part, value) {
    db.data[part] = value;
    await db.write();
}


export { getDatabase, setDatabase };