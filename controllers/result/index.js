import Router from 'express';
import { catchAsyncAction, makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import { findAllLotteryResults, findFestivalLotteryDetail, findLotteryDetail } from '../../services/index.js';

//Response messages
const { FETCH_USER } = responseMessages.EN;
//Response status code
const { SUCCESS, NOT_FOUND } = statusCodes;

const router = Router();

// Result List API
router.get('/', catchAsyncAction(async (req, res) => {
    const getRecord = await findAllLotteryResults();
    const result = [];
    for (const item of getRecord) {
        const festivalLottery = await findFestivalLotteryDetail({ _id: item.ticketId });
        const worldLottery = await findLotteryDetail({ _id: item?.ticketId });
        result.push({
            ticketDetails: festivalLottery ? festivalLottery : worldLottery,
            ...item._doc
        })
    }
    return makeResponse(res, SUCCESS, true, FETCH_USER, result);
}));

export const resultController = router;
