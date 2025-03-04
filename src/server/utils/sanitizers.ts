// TODO : Move this to commons as it is also used by the client side

export type FormInputChecker = (value: string) => { valid: boolean, error?: string };

const invalid = (reason: string) => ({ valid: false, error: reason });
const valid = () => ({ valid: true });

export const usernameRegex = /^[a-zA-Z0-9_\-\.!?&]{3,32}$/;
export const usernameChecker: FormInputChecker = (username: string) => {
    if(username.replace(" ", "").length !== username.length) return invalid("Username cannot contain spaces");
    if(username.length < 3 || username.length > 32) return invalid("Username must be between 3 and 32 characters long");
    const regex = usernameRegex;
    if(!username.match(regex)) return invalid("Username must only contain alphanumerical characters");
    
    return valid();
}

export const emailRegex = /^(([^<>\(\)\[\]\\.,;:\s@"]+(\.[^<>\(\)\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const emailChecker: FormInputChecker = (email: string) => {
    if(!email.match(emailRegex)) return invalid("Email is not correct");
    return valid();
}

// Inspired from: https://uibakery.io/regex-library/password
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[\sA-Za-z\d@.#$!%*?&]{8,32}$/;
export const passwordChecker: FormInputChecker = (password: string) => {
    if(password.length < 8 || password.length > 32) return invalid('Password must be between 8 and 32 characters long');
    if(!/[A-Z]/.test(password)) return invalid('Password must contain at least one capital letter (A to Z)');
    if(!/[a-z]/.test(password)) return invalid('Password must contain at least one lowercase letter (a to z)');
    if(!/[0-9]/.test(password)) return invalid('Password must contain at least one digit (0 and 9)');
    if(!/[_#?!@$%^&*-]/.test(password)) return invalid('Password must contain at least one special character (_#?!@$%^&*-)');
    return valid();
}

