import { makeResponse, statusCodes } from "../index.js";


// Wrapper for catch block
export const catchAsyncAction = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => makeResponse(res, statusCodes.BAD_REQUEST, false, err.message));
    };
};
