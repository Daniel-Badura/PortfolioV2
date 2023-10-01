import crypto from 'crypto';

export const generateToken = () => {
    const token = crypto.randomBytes(4).toString('hex');
    return token;
};