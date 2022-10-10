import Router from 'express';
import { catchAsyncAction, makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import { addWithdraw, findWithdrawDetails, updateWithdraw } from '../../services/index.js';

//Response messages
const { USER_ADDED, FETCH_USER, UPDATE_USER } = responseMessages.EN;
//Response status code
const { RECORD_CREATED, SUCCESS, NOT_FOUND } = statusCodes;

const router = Router();

//Add User
router.post('/', catchAsyncAction(async (req, res) => {
    const newWithdraw = await addWithdraw(req.body);
    return makeResponse(res, RECORD_CREATED, true, USER_ADDED, newWithdraw);
}));

// Update Withdraw
router.patch('/:id', catchAsyncAction(async (req, res) => {
    const getRecord = await findWithdrawDetails({ _id: req.params._id });
    if (!getRecord) return makeResponse(res, NOT_FOUND, false, NOT_FOUND);
    const updateWithdrawDetails = await updateWithdraw(req.body, { _id: req.params.id });
    return makeResponse(res, SUCCESS, true, UPDATE_USER, updateWithdrawDetails);
}));

// Withdraw Details
router.get('/withdraw-details/:id', catchAsyncAction(async(req, res) => {
    const getRecord = await findWithdrawDetails({ _id: req.params.id });
    if (!getRecord) return makeResponse(res, NOT_FOUND, false, NOT_FOUND);
    return makeResponse(res, SUCCESS, true, FETCH_USER, getRecord);
}));

export const withdrawController = router;
