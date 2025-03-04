import bcrypt from 'bcrypt';

export const hash = async (rawPassword: string) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);
    return hash;
};

export const verify = async (rawPassword: string, hash: string) => {
    return bcrypt.compare(rawPassword, hash);
};
