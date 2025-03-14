export type FormInputChecker = (value: string) => { valid: boolean, message?: string };
export type WholeFormChecker = (value: object) => { valid: boolean, field?: string, message?: string };

export const invalid = (reason: string) => ({ valid: false, message: reason });
export const valid = () => ({ valid: true });

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
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_#?!@$%^&*\-])[\sA-Za-z\d_@.#$!%*?&\-]{8,32}$/;
export const passwordChecker: FormInputChecker = (password: string) => {
    if(password.length < 8 || password.length > 32) return invalid('Password must be between 8 and 32 characters long');
    if(!/[A-Z]/.test(password)) return invalid('Password must contain at least one capital letter (A to Z)');
    if(!/[a-z]/.test(password)) return invalid('Password must contain at least one lowercase letter (a to z)');
    if(!/[0-9]/.test(password)) return invalid('Password must contain at least one digit (0 and 9)');
    if(!/[_#?!@$%^&*-]/.test(password)) return invalid('Password must contain at least one special character (_#?!@$%^&*-)');
    return valid();
}

export const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const uuidChecker: FormInputChecker = (uuid: string) => {
    if(uuid.match(uuidv4Regex)) return valid();
    return invalid('Invalid UUID');
}

export const loginChecker: FormInputChecker = (login: string) => {
    const isUsername = usernameChecker(login);
    const isEmail = emailChecker(login);
    if(!isEmail.valid && !isUsername.valid) return invalid('Login is invalid');
    return valid();
}
