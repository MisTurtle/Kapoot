import { Response as eResponse } from 'express';
import { production } from './utils';

type ResponseStatus = ( | { error: string, result?: string } | { error?: undefined, result?: string } );


/**
 * Express Error Responses to send to the client
 * @param resObj Express response object passed as argument of middlewares
 */
export function error(resObj: eResponse, message: string, status: number = 200)
{
    return custom(resObj, { error: message }, status);
}
export function success(resObj: eResponse, data?: any, status: number = 200)
{
    return custom(resObj, { result: data }, status);
}
export function custom(resObj: eResponse, response: ResponseStatus, status: number = 200)
{
    return resObj.status(status).json(response);
}

/**
 * Client side custom handling function
 * @param res Fetch result
 * @param onSuccess Success callback
 * @param onFailure Failure callback
 */
export async function handle<T>(res: Response, onSuccess: (result?: T) => void, onFailure: (error: string) => void)
{
    const json: ResponseStatus = await res.json();
    if(json.error) return onFailure(json.error);
    else try {
        return onSuccess(json.result as T);
    } catch (err) {
        return onFailure("Unknown error... " + err);
    };
}
