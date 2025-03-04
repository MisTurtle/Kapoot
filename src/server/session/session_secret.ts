import fs from 'fs';
import { rootPath } from '../../common/utils.js';

/**
 * Generate a new session secret if none is found locally
 * A session secret is stored as an object with the following structure: { "value": "token", "until": "timestamp of expiry" } 
 * If every secret is expired, a new one will be added to the list.
 */
interface Secret {
    value: string;
    until: number;
}

const secretValidity = { year: 0, months: 1, days: 0 };
const pathToSecret = rootPath("private", "session-secrets.json");
export const allValidSecrets: string[] = [];
export const sessionCookieLifetime = 1000 * 60 * 60 * 24;

function createSecret(): Secret
{
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + secretValidity.year, expiry.getMonth() + secretValidity.months, expiry.getDay() + secretValidity.days);
    const ascii = Array.from({length: 32}, () => String.fromCharCode(0x21 + Math.floor(Math.random() * (0x7D - 0x21))));
    return { value: ascii.join(""), until: expiry.getTime() };
}

function reloadSecrets(): void
{
    fs.mkdirSync(rootPath('private'), { recursive: true });
    if(!fs.existsSync(pathToSecret)) fs.writeFileSync(pathToSecret, "[]");
    
    const currentTime = (new Date()).getTime();
    const allSecrets: Secret[] = JSON.parse(fs.readFileSync(pathToSecret, 'utf-8'));
    const anyValid = allSecrets.length > 0 && allSecrets[0].until > currentTime;
    if(!anyValid) 
    {
        allSecrets.unshift(createSecret());
        fs.writeFileSync(pathToSecret, JSON.stringify(allSecrets));
    }
    
    allValidSecrets.length = 0;
    allValidSecrets.push(...allSecrets.map(s => s.value));
}

reloadSecrets();
setInterval(reloadSecrets, 3600 * 1000);  // Every 1 hour by default