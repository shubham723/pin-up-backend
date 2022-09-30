import Router from 'express';
import { adminController } from '../controllers/admin/index.js';
import {
    festivalLotteryController,
    usersController,
    worldLotteryController
} from '../controllers/index.js'

const router = Router();

router.use('/users', usersController);
router.use('/worldlottery', worldLotteryController);
router.use('/festivallottery', festivalLotteryController);
router.use('/admin/', adminController);

export { router };
