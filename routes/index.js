import Router from 'express';
import {
    adminController,
    festivalLotteryController,
    paymentController,
    usersController,
    withdrawController,
    worldLotteryController
} from '../controllers/index.js'

const router = Router();

router.use('/users', usersController);
router.use('/worldlottery', worldLotteryController);
router.use('/festivallottery', festivalLotteryController);
router.use('/admin/', adminController);
router.use('/razorpay/', paymentController);
router.use('/withdraw/', withdrawController);

export { router };
