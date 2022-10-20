import Router from 'express';
import { catchAsyncAction, makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import { findMult } from '../../services/index.js';

//Response messages
const { FETCH_USER } = responseMessages.EN;
//Response status code
const { SUCCESS } = statusCodes;

const router = Router();

// Mult API
router.get('/', catchAsyncAction(async (req, res) => {
    const multRecord = await findMult();
    return makeResponse(res, SUCCESS, true, FETCH_USER, multRecord);
}));

export const multController = router;
