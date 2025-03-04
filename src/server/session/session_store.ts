import session from 'express-session';
import { getEndpoints } from '../database/database_controller';

export default class CustomSessionStore extends session.Store
{
    async get(sid: string, callback: (err: any, session?: session.SessionData | null) => void): Promise<void> {
        console.log("Getting session id cookie");
        
        console.log(sid);
        console.log(callback);
        try {
            const session = await getEndpoints().loadSession(sid);
            console.log("Session get:" + session);
            callback(null, session);
        } catch (err) { callback(err); }
    }
    set(sid: string, session: session.SessionData, callback?: (err?: any) => void): void {
        console.log("Setting session id cookie");
        
        console.log(sid);
        console.log(session);
        console.log(callback);   

        try {
            getEndpoints().saveSession(sid);
            if(callback) callback(null);
        }catch(err) {
            if(callback) callback(err);
        }
    }
    destroy(sid: string, callback?: (err?: any) => void): void {
        console.log("Destroying session id cookie");

        console.log(sid);
        console.log(callback);
    }
}