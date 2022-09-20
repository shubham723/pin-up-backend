import Joi from "joi";
import { makeResponse, statusCodes } from "../../helpers/index.js";
import validateSchema from "./schema.js";

// Input Validations
export const validators = (payload) =>
    async (req, res, next) => {
        const schema = Joi.object(validateSchema(payload));
        const { error } = schema.validate(req.body, { allowUnknown: true });
        if (error) return makeResponse(res, statusCodes.BAD_REQUEST, false, error.message);
        next();
    };
    