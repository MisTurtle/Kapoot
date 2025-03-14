import session from 'express-session';
import { getEndpoints } from '@server/database/database_controller';

export default class CustomSessionStore extends session.Store
{
    async get(sid: string, callback: (err: any, session?: session.SessionData | null) => void): Promise<void> {

        try {
            const session = await getEndpoints().loadSession(sid);
            callback(null, session);
        } catch (err) { callback(err); }
    }
    set(sid: string, session: session.SessionData, callback?: (err?: any) => void): void {
        try {
            getEndpoints().saveSession(sid);
            if(callback) callback(null);
        }catch(err) {
            if(callback) callback(err);
        }
    }
    destroy(sid: string, callback?: (err?: any) => void): void {
        
    }
}