import Router from 'express';
import {
    festivalLotteryController,
    usersController,
    worldLotteryController
} from '../controllers/index.js'

const router = Router();

router.use('/users', usersController);
router.use('/worldlottery', worldLotteryController);
router.use('/festivallottery', festivalLotteryController);

export { router };
