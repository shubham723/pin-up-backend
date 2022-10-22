import Router from 'express';
import { catchAsyncAction, makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import { chatList, findChat, findUserById } from '../../services/index.js';

//Response messages
const { LOTTERY_FETCHED } = responseMessages.EN;
//Response status code
const { SUCCESS } = statusCodes;

const router = Router();

// Fetch Chat List
router.get('/list', catchAsyncAction(async (req, res) => {
    const messageRecord = await chatList({ $or: [{ senderId: req.body?.userId }, { receiverId: req.body?.userId }] });
    const result = [];
    for (const item of messageRecord) {
        let userDetail = {};
        if (item?.senderType === "ADMIN") {
            userDetail = await findUserById({ _id: item?.receiverId})
        }
        else {
            userDetail = await findUserById({ _id: item?.senderId });
        }
        result.push({
            ...item,
            userDetail
        })
    }
    return makeResponse(res, SUCCESS, true, LOTTERY_FETCHED, result);
}));

// Fetch Chat Details
router.get('/:id', catchAsyncAction(async (req, res) => {
    if (req.params?.id) {
        const getRecord = await findChat({ senderId: req.params?.id });
        return makeResponse(res, SUCCESS, true, LOTTERY_FETCHED, getRecord);
    }
    else {
        return makeResponse(res, SUCCESS, true, LOTTERY_FETCHED, []);
    }
}));

export const chatController = router;
