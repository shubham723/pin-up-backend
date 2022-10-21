import Router from 'express';
import {
    adminController,
    chatController,
    festivalLotteryController,
    multController,
    paymentController,
    resultController,
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
router.use('/result/', resultController);
router.use('/mult/', multController);
router.use('/chat/', chatController);

export { router };
