import dotenv from 'dotenv';
dotenv.config();
let {
    DB_STRING_LIVE,
    JWT_SECRET,
    nodemailerEmail,
    base_url,
    api_key,
    nodemailerPassword,
    admin_mail,
    DB_STRING_DEV,
    CRON_KEY
} = process.env;


export const privateKey = {
    'DB_STRING': DB_STRING_LIVE,
    'DB_STRING_DEV':DB_STRING_DEV,
    'email': nodemailerEmail,
    'JWT': JWT_SECRET,
    'baseUrl': base_url,
    'key': api_key,
    'password': nodemailerPassword,
    'CRON_KEY': CRON_KEY,
    'ADMIN_MAIL': admin_mail,
    'CRON_KEY': CRON_KEY
}
