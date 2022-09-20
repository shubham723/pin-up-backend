import Router from 'express';
import { catchAsyncAction, makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import { addLottery, findAllLottery, findLotteryDetail, updateLottery } from '../../services/index.js';

//Response messages
const { LOTTERY_ADDED, UPDATE_LOTTERY, LOTTERY_FETCHED } = responseMessages.EN;
//Response status code
const { RECORD_CREATED, SUCCESS, NOT_FOUND } = statusCodes;

const router = Router();

//Add User
router.post('/', catchAsyncAction(async (req, res) => {
    const newWorldlottery = await addLottery(req.body);
    return makeResponse(res, RECORD_CREATED, true, LOTTERY_ADDED, newWorldlottery);
}));

// Update Lottery 
router.patch('/:id', catchAsyncAction(async (req, res) => {
    const getRecord = await findLotteryDetail({ _id: req.params.id });
    if (!getRecord) return makeResponse(res, NOT_FOUND, false, NOT_FOUND);
    const updateWorldLottery = await updateLottery(req.body, { _id: req.params.id });
    return makeResponse(res, SUCCESS, true, UPDATE_LOTTERY, updateWorldLottery);
}));

// Fetch Lottery
router.get('/', catchAsyncAction(async(req, res) => {
    const getRecord = await findAllLottery();
    return makeResponse(res, SUCCESS, true, LOTTERY_FETCHED, getRecord);
}));

// Fetch Lottery Details
router.get('/:id', catchAsyncAction(async(req, res) => {
    const getRecord = await findLotteryDetail({ _id: req.params.id });
    return makeResponse(res, SUCCESS, true, LOTTERY_FETCHED, getRecord);
}));

export const worldLotteryController = router;
