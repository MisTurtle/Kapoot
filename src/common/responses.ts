import { Response as eResponse } from 'express';

type ResponseStatus = {
    error?: string;  // Error string
    result?: string;  // Success string
    payload?: string;  // Response payload
};


/**
 * Express Error Responses to send to the client
 * @param resObj Express response object passed as argument of middlewares
 */
export function error(resObj: eResponse, message: string, status: number = 200)
{
    return custom(resObj, { error: message }, status);
}
export function success(resObj: eResponse, message: string, status: number = 200)
{
    return custom(resObj, { result: message }, status);
}
export function payload(resObj: eResponse, payload: any, message?: string, status: number = 200)
{
    let response: ResponseStatus = { payload: payload };
    if(message) response.result = message;
    return custom(resObj, response, status);
}
export function custom(resObj: eResponse, response: ResponseStatus, status: number = 200)
{
    return resObj.status(200).json(response);
}
