export type FormInputChecker = (value: string) => { valid: boolean, error?: string };

export const usernameChecker: FormInputChecker = (username: string) => {
    
    if(username.trim() !== username) return { valid: false, error: "Username cannot contain leading or trailing spaces" };
    if(username.length < 3 || username.length > 32) return { valid: false, error: "Username must be between 3 and 32 characters long" };
    const regex = /^[a-zA-Z0-9_\-\.!?& ]{3,32}$/;
    if(!username.match(regex)) return { valid: false, error: "Username must only contain alphanumerical characters" };
    
    return { valid: true };

}

export const emailChecker: FormInputChecker = (email: string) => {
    return { valid: true };  // TODO
}

export const pwdHashChecker: FormInputChecker = (pwdHash: string) => {
    return { valid: true }; // TODO
}

export const saltChecker: FormInputChecker = (salt: string) => {
    return { valid: true }; // TODO
}

