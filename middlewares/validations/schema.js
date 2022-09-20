import Joi from 'joi';

// Validation Cases
const validations = (action) => {
    switch (action) {
        case 'ADD_USER': {
            return {
                email: Joi.string().email().required(),
                password: Joi.string().required()
            };
        }
        case 'VERIFY_OTP': {
            return {
                otp: Joi.number().required(),
                device_token: Joi.string().optional(),
                email: Joi.string().email().required()
            }
        }
        case 'UPDATE_USER': {
            return {
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                address: Joi.array().items(Joi.object({
                    formattedAddress: Joi.string().required(),
                    geo: Joi.array().items(Joi.string().required())
                })),
                interests: Joi.array().items(Joi.string().required()),
                about: Joi.string().required(),
                gender: Joi.string().required(),
                interested_in: Joi.string().required()
            }
        }
        case 'RESET_PASSWORD': {
            return {
                password: Joi.string().required(),
                email: Joi.string().email().required()
            }
        }
        case 'ADD_REQUEST': {
            return {
                postId: Joi.string().required(),
                receiverId: Joi.string().required(),
                status: Joi.string().required()
            }
        }
        case 'REPORT': {
            return {
                reportedBy: Joi.array().items(Joi.string().required()).required()
            }
        }
        case 'FORGET_PASSWORD': {
            return {
                email: Joi.string().email().required()
            }
        }
        case 'LOGIN': {
            return {
                email: Joi.string().email().required(),
                password: Joi.string().required()
            }
        }
        case 'ADD_POST': {
            return {
                title: Joi.string().required(),
                description: Joi.string().required(),
                requiredPeople: Joi.number().required(),
                eventTime: Joi.string().required(),
                eventDate: Joi.string().required(),
                venue: Joi.string().required(),
                categories: Joi.array().items(Joi.string().required()).required()
            }
        }
        case 'CHANGE_STATUS': {
            return {
                status: Joi.string().required()
            }
        }
        case 'REFRESH_TOKEN': {
            return {
                refreshToken: Joi.string().required()
            }
        }
        case 'CHANGE_PASSWORD': {
            return {
                oldPassword: Joi.string().required(),
                newPassword: Joi.string().required()
            }
        }
        case 'ADD_CATEGORIES': {
            return {
                name: Joi.string().required(),
                image: Joi.string().optional()
            }
        }
        case 'UPDATE_CATEGORIES': {
            return {
                name: Joi.string().optional(),
                image: Joi.string().optional()
            }
        }
        case 'CONTACT': {
            return {
                name: Joi.string().required(),
                email: Joi.string().required(),
                message: Joi.string().required()
            }
        }
        case 'RESEND_OTP': {
            return {
                email: Joi.string().required(),
            }
        }
        case 'UPDATE_SETTINGS': {
            return {
                email: Joi.string()
                    .allow(''),
                mobile: Joi.string()
                    .allow(''),
                ios_version: Joi.string()
                    .allow(''),
                android_version: Joi.string()
                    .allow(''),
                force_update: Joi.string()
                    .valid('0', '1')
                    .allow('')
            }
        }
        case 'NOTIFICATION_UPDATE': {
            return {
                isNotify: Joi.boolean().required()
            }
        }
    }
    return {};
};

export default validations;