import Router from 'express';
import { catchAsyncAction, makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import { addFestivalLottery, findAllFestivalLottery, findFestivalLottery, updateFestivalLottery } from '../../services/index.js';

//Response messages
const { LOTTERY_ADDED, UPDATE_LOTTERY, LOTTERY_FETCHED } = responseMessages.EN;
//Response status code
const { RECORD_CREATED, SUCCESS, NOT_FOUND } = statusCodes;

const router = Router();

//Add User
router.post('/', catchAsyncAction(async (req, res) => {
    const newWorldlottery = await addFestivalLottery(req.body);
    return makeResponse(res, RECORD_CREATED, true, LOTTERY_ADDED, newWorldlottery);
}));

// Update Lottery
router.patch('/:id', catchAsyncAction(async (req, res) => {
    const getRecord = await findFestivalLottery({ _id: req.params._id });
    if (!getRecord) return makeResponse(res, NOT_FOUND, false, NOT_FOUND);
    const updateWorldLottery = await updateFestivalLottery(req.body, { _id: req.params.id });
    return makeResponse(res, SUCCESS, true, UPDATE_LOTTERY, updateWorldLottery);
}));

// Fetch Lottery
router.get('/', catchAsyncAction(async(req, res) => {
    const getRecord = await findAllFestivalLottery({ isDeleted: false });
    return makeResponse(res, SUCCESS, true, LOTTERY_FETCHED, getRecord);
}));

// Fetch Lottery Details
router.get('/:id', catchAsyncAction(async(req, res) => {
    const getRecord = await findFestivalLottery({ _id: req.params.id });
    return makeResponse(res, SUCCESS, true, LOTTERY_FETCHED, getRecord);
}));

export const festivalLotteryController = router;
