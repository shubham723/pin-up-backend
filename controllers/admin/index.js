import Router from 'express';
import { privateKey } from '../../config/privateKeys.js';
import authAdmin from '../../middlewares/auth/admin.js';
import { catchAsyncAction, makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import { addAdmin, addFestivalLottery, addLottery, addResult, addUser, chatList, findAdminById, findAdminDetail, findAllFestivalList, findAllFestivalLotteryCount, findAllLottery, findAllLotteryResults, findAllPaymentCounts, findAllPaymentList, findAllResultCount, findAllUsers, findAllUsersCount, findAllUsersList, findAllWithdraw, findAllWorldLottery, findAllWorldLotteryCount, findChat, findFestivalLotteryDetail, findLotteryDetail, findPaymentById, findPaymentDetails, findResultById, findUserById, findUserDetail, findWithdrawDetails, generateOtp, getUsersCount, getWithdrawCount, hashPassword, matchPassword, sendEmail, updateAdmin, updateFestivalLottery, updateResult, updateUserDetail, updateWithdraw, updateWorldLotteryDetail, userDetail, verifyToken, worldLotteryDetail } from '../../services/index.js';
import { validators } from '../../middlewares/validations/index.js';
import { userMapper } from '../../helpers/mapper/index.js';
import moment from 'moment';

//Response messages
const { USER_ADDED, LOGIN, OTP_MISMATCH, FETCH_USER, ALREADY_REGISTER, INVALID_EMAIL, PASSWORD_INVALID, VERIFY_OTP, OTP_FOR_PASSWORD, PASSWORD_REQUIRED, OTP_SENT, LOGOUT,
    PASSWORD_CHANGED, USER_NOTFOUND, EMAIL_NOT_REGISTER, ACCOUNT_DISABLED, LOTTERY_ADDED, FETCH_WEEK_USER } = responseMessages.EN;
//Response status code
const { RECORD_CREATED, RECORD_ALREADY_EXISTS, SUCCESS, NOT_FOUND, AUTH_ERROR, BAD_REQUEST, FORBIDDEN } = statusCodes;

const router = Router();

//Add Admin
router.post('/', catchAsyncAction(async (req, res) => {
    const { email } = req.body;
    const adminRecord = await findAdminDetail({ email });
    if (adminRecord) return makeResponse(res, RECORD_ALREADY_EXISTS, false, ALREADY_REGISTER);
    //encrypt password
    const password = await hashPassword(req.body.password);
    if (password) req.body.password = password;
    const newAdmin = await addAdmin(req.body);
    //Genrate access token and Refresh token
    const accessToken = newAdmin.generateAuthToken(newAdmin._id);
    const refreshToken = newAdmin.generateRefershToken(newAdmin._id);
    //Delete fileds temporary from response
    const adminDetail = await userMapper(newAdmin);
    return makeResponse(res, RECORD_CREATED, true, USER_ADDED, adminDetail, { accessToken, refreshToken });
}));

//Login admin
router.post('/login', validators('LOGIN'), catchAsyncAction(async (req, res) => {
    const { email, password } = req.body;
    const admin = await findAdminDetail({ email });
    if (!admin) return makeResponse(res, NOT_FOUND, false, INVALID_EMAIL);
    if (admin?.isDeleted == true || admin?.status == false) return makeResponse(res, FORBIDDEN, false, ACCOUNT_DISABLED);
    const checkPassword = await matchPassword(password, admin.password);
    if (!checkPassword) return makeResponse(res, AUTH_ERROR, false, PASSWORD_INVALID);
    const adminDetail = await userMapper(admin);
    //Genrate auth token
    const accessToken = admin.generateAuthToken(admin._id);
    const refreshToken = admin.generateRefershToken(admin._id);
    return makeResponse(res, SUCCESS, true, LOGIN, adminDetail, { accessToken, refreshToken });
}));

//Forgot-password
router.post('/forgot-password', validators('FORGET_PASSWORD'), catchAsyncAction(async (req, res) => {
    const otp = generateOtp();
    const { email } = req.body;
    let admin = await findAdminDetail({ email });
    if (!admin) throw new Error(EMAIL_NOT_REGISTER);
    else {
        await sendEmail({
            from: privateKey.email,
            to: req.body.email,
            subject: 'OTP for password reset',
            text: `The OTP for resetting your password is ${otp}`
        });
        await updateAdmin({ otp }, { email: req.body.email });
        return makeResponse(res, SUCCESS, true, OTP_FOR_PASSWORD);
    }
}));

//Verify OTP
router.post('/verify-otp', validators('VERIFY_OTP'), catchAsyncAction(async (req, res) => {
    const adminData = await findAdminById({ email: req.body.email });
    if (!adminData) return makeResponse(res, NOT_FOUND, false, USER_NOTFOUND);
    if (adminData.otp === req.body.otp) {
        const adminDetail = await userMapper(adminData);
        //Genrate auth token
        const accessToken = adminData.generateAuthToken(adminData._id);
        const refreshToken = adminData.generateRefershToken(adminData._id);
        return makeResponse(res, SUCCESS, true, VERIFY_OTP, adminDetail, { accessToken, refreshToken });
    }
    return makeResponse(res, BAD_REQUEST, false, OTP_MISMATCH);
}));

//Reset Password
router.post('/reset-password', validators('RESET_PASSWORD'), catchAsyncAction(async (req, res) => {
    const adminData = await findAdminById({ email: req.body.email });
    if (!adminData) return makeResponse(res, NOT_FOUND, false, USER_NOTFOUND);
    const password = await hashPassword(req.body.password);
    await updateAdmin({ password }, { email: req.body.email });
    return makeResponse(res, SUCCESS, true, PASSWORD_CHANGED);
}));


//Get Admin profile
router.get("/me", authAdmin, (req, res) => {
    findAdminById({ _id: req.adminData.id })
        .then(async (admin) => {
            //Delete fileds temporary from response
            delete admin._doc.otp;
            delete admin._doc.password;
            return makeResponse(
                res,
                SUCCESS,
                true,
                FETCH_USER,
                admin
            );
        })
        .catch(async (error) => {
            return makeResponse(
                res,
                BAD_REQUEST,
                false, error.message
            );
        });
});

// Resend OTP
router.post('/resend-otp', validators('RESEND_OTP'), catchAsyncAction(async (req, res) => {
    const otp = generateOtp();
    return Promise.all(
        [
            sendEmail({
                from: privateKey.email,
                to: req.body.email,
                subject: 'OTP for password reset',
                text: `The OTP for resetting your password is ${otp}`
            }),
            updateAdmin({ otp }, { email: req.body.email })

        ]
    ).then(result => {
        //Genrate auth token
        const accessToken = result[1].generateAuthToken(result[1]._id);
        const refreshToken = result[1].generateRefershToken(result[1]._id);
        return makeResponse(res, SUCCESS, true, OTP_SENT, { accessToken, refreshToken })
    }).catch(error => {
        return makeResponse(res, BAD_REQUEST, false, error.message);
    })
}));

// Add User
router.post('/user', catchAsyncAction(async (req, res) => {
    const { email } = req.body;
    const userRecord = await findUserDetail({ email });
    if (userRecord) return makeResponse(res, RECORD_ALREADY_EXISTS, false, ALREADY_REGISTER);
    //encrypt password
    const password = await hashPassword(req.body.password);
    if (password) req.body.password = password;
    const newUser = await addUser(req.body);
    //Delete fileds temporary from response
    const userDetail = await userMapper(newUser);
    return makeResponse(res, RECORD_CREATED, true, USER_ADDED, userDetail);
}));

// Dashboard
router.get('/dashboard', catchAsyncAction(async (req, res) => {
    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');
    const searchingUser = {
        isDeleted: false, createdAt: { $gte: startOfWeek, $lte: endOfWeek }
    }
    const totalUserCount = await getUsersCount({ isDeleted: false });
    const totalFestivalLotteryCount = await findAllFestivalLotteryCount({ isDeleted: false });
    const totalWorldLotteryCount = await findAllWorldLotteryCount({ isDeleted: false });
    const weekUsersCount = await findAllUsersCount(searchingUser);
    return makeResponse(res, SUCCESS, true, FETCH_USER, { totalUserCount, totalFestivalLotteryCount, totalWorldLotteryCount, weekUsersCount });
}));

//User List
router.get('/users', catchAsyncAction(async (req, res) => {
    let searchingUser = {};
    let page = 1,
        limit = 10,
        skip = 0,
        status;
    if (req.query.status) status = req.query.status;
    if (req.query.page == 0) req.query.page = '';
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    skip = (page - 1) * limit;
    let regx;
    let searchFilter = req.query;
    if (searchFilter?.search) {
        regx = new RegExp(searchFilter?.search);
        searchingUser = {
            isDeleted: false, $or: [{ 'firstName': { '$regex': regx, $options: 'i' } }]
        }
    };
    if (!searchFilter?.search) {
        searchingUser = {
            isDeleted: false,
        }
    };
    if (status) searchingUser["status"] = status;
    let userRecord = await findAllUsersList(skip, limit, searchingUser);
    let userCount = await findAllUsersCount(searchingUser);
    return makeResponse(res, SUCCESS, true, FETCH_USER, userRecord, {
        current_page: Number(page),
        total_records: userCount,
        total_pages: Math.ceil(userCount / limit),
    });
}));

//User Details
router.get('/user/:id', catchAsyncAction(async (req, res) => {
    let userRecord = await userDetail({ _id: req.params.id });
    return makeResponse(res, SUCCESS, true, FETCH_USER, userRecord);
}));

//Update User
router.patch('/user/:id', catchAsyncAction(async (req, res) => {
    let updatedUser = await updateUserDetail({ _id: req.params.id }, req.body);
    let updateUserProfile = await userMapper(updatedUser);
    return makeResponse(res, SUCCESS, true, FETCH_USER, updateUserProfile);
}));

//this week users List
router.get('/get_recent_users', catchAsyncAction(async (req, res) => {
    let searchingUser = {};
    let page = 1,
        limit = 10,
        skip = 0;
    if (req.query.page == 0) req.query.page = '';
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    skip = (page - 1) * limit;
    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');
    searchingUser = {
        isDeleted: false, createdAt: { $gte: startOfWeek, $lte: endOfWeek }
    }
    const thisWeekRecords = await findAllUsersList(skip, limit, searchingUser);
    const userCount = await findAllUsersCount(searchingUser);
    return makeResponse(res, SUCCESS, true, FETCH_WEEK_USER, thisWeekRecords, {
        current_page: Number(page),
        total_records: userCount,
        total_pages: Math.ceil(userCount / limit),
    });
}));

// Add World Lottery
router.post('/world-lottery', catchAsyncAction(async (req, res) => {
    const newWorldlottery = await addLottery(req.body);
    return makeResponse(res, RECORD_CREATED, true, LOTTERY_ADDED, newWorldlottery);
}));

//World Lottery List
router.get('/world-lottery', catchAsyncAction(async (req, res) => {
    let searchingUser = {};
    let page = 1,
        limit = 10,
        skip = 0,
        status;
    if (req.query.status) status = req.query.status;
    if (req.query.page == 0) req.query.page = '';
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    skip = (page - 1) * limit;
    let regx;
    let searchFilter = req.query;
    if (searchFilter?.search) {
        regx = new RegExp(searchFilter?.search);
        searchingUser = {
            isDeleted: false, $or: [{ 'firstName': { '$regex': regx, $options: 'i' } }]
        }
    };
    if (!searchFilter?.search) {
        searchingUser = {
            isDeleted: false,
        }
    };
    if (status) searchingUser["status"] = status;
    let worldLotteryRecord = await findAllWorldLottery(skip, limit, searchingUser);
    let worldLotteryCount = await findAllWorldLotteryCount(searchingUser);
    return makeResponse(res, SUCCESS, true, FETCH_USER, worldLotteryRecord, {
        current_page: Number(page),
        total_records: worldLotteryCount,
        total_pages: Math.ceil(worldLotteryCount / limit),
    });
}));

//World Lottery Details
router.get('/world-lottery/:id', catchAsyncAction(async (req, res) => {
    let weeklyLottery = await worldLotteryDetail({ _id: req.params.id });
    return makeResponse(res, SUCCESS, true, FETCH_USER, weeklyLottery);
}));

//Update World Lottery
router.patch('/world-lottery/:id', catchAsyncAction(async (req, res) => {
    let weeklyLottery = await updateWorldLotteryDetail({ _id: req.params.id }, req.body);
    return makeResponse(res, SUCCESS, true, FETCH_USER, weeklyLottery);
}));

// Add Festival Lottery
router.post('/festival-lottery', catchAsyncAction(async (req, res) => {
    const newFestivalLottery = await addFestivalLottery(req.body);
    return makeResponse(res, RECORD_CREATED, true, LOTTERY_ADDED, newFestivalLottery);
}));

//Festival Lottery List
router.get('/festival-lottery', catchAsyncAction(async (req, res) => {
    let searchingUser = {};
    let page = 1,
        limit = 10,
        skip = 0,
        status;
    if (req.query.status) status = req.query.status;
    if (req.query.page == 0) req.query.page = '';
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    skip = (page - 1) * limit;
    let regx;
    let searchFilter = req.query;
    if (searchFilter?.search) {
        regx = new RegExp(searchFilter?.search);
        searchingUser = {
            isDeleted: false, $or: [{ 'firstName': { '$regex': regx, $options: 'i' } }]
        }
    };
    if (!searchFilter?.search) {
        searchingUser = {
            isDeleted: false,
        }
    };
    if (status) searchingUser["status"] = status;
    let festivalLotteryRecord = await findAllFestivalList(skip, limit, searchingUser);
    let festivalLotteryCount = await findAllFestivalLotteryCount(searchingUser);
    return makeResponse(res, SUCCESS, true, FETCH_USER, festivalLotteryRecord, {
        current_page: Number(page),
        total_records: festivalLotteryCount,
        total_pages: Math.ceil(festivalLotteryCount / limit),
    });
}));

//Festival Lottery Details
router.get('/festival-lottery/:id', catchAsyncAction(async (req, res) => {
    let festivalLottery = await findFestivalLotteryDetail({ _id: req.params.id });
    return makeResponse(res, SUCCESS, true, FETCH_USER, festivalLottery);
}));

//Update Festival Lottery
router.patch('/festival-lottery/:id', catchAsyncAction(async (req, res) => {
    let festivalLottery = await updateFestivalLottery({ _id: req.params.id }, req.body);
    return makeResponse(res, SUCCESS, true, FETCH_USER, festivalLottery);
}));

//Payment List
router.get('/payment', catchAsyncAction(async (req, res) => {
    let searchingUser = {};
    let page = 1,
        limit = 10,
        skip = 0,
        status;
    if (req.query.status) status = req.query.status;
    if (req.query.page == 0) req.query.page = '';
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    skip = (page - 1) * limit;
    let regx;
    let searchFilter = req.query;
    if (searchFilter?.search) {
        regx = new RegExp(searchFilter?.search);
        searchingUser = {
            isDeleted: false, $or: [{ 'firstName': { '$regex': regx, $options: 'i' } }]
        }
    };
    if (!searchFilter?.search) {
        searchingUser = {
            isDeleted: false,
        }
    };
    if (status) searchingUser["status"] = status;
    let paymetRecords = await findAllPaymentList(skip, limit);
    let paymentCount = await findAllPaymentCounts();
    return makeResponse(res, SUCCESS, true, FETCH_USER, paymetRecords, {
        current_page: Number(page),
        total_records: paymentCount,
        total_pages: Math.ceil(paymentCount / limit),
    });
}));

//Payment Details
router.get('/payment/:id', catchAsyncAction(async (req, res) => {
    const paymentDetails = await findPaymentDetails({ _id: req.params.id });
    return makeResponse(res, SUCCESS, true, FETCH_USER, paymentDetails);
}));

//Withdraw List
router.get('/withdraw', catchAsyncAction(async (req, res) => {
    let searchingWithdraw = {};
    let page = 1,
        limit = 10,
        skip = 0,
        status;
    if (req.query.status) status = req.query.status;
    if (req.query.page == 0) req.query.page = '';
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    skip = (page - 1) * limit;
    let regx;
    let searchFilter = req.query;
    if (searchFilter?.search) {
        regx = new RegExp(searchFilter?.search);
        searchingWithdraw = {
            isDeleted: false, $or: [{ 'firstName': { '$regex': regx, $options: 'i' } }]
        }
    };
    if (status) searchingWithdraw["status"] = status;
    let withdrawRecords = await findAllWithdraw(searchingWithdraw, skip, limit);
    let withdrawCount = await getWithdrawCount();
    return makeResponse(res, SUCCESS, true, FETCH_USER, withdrawRecords, {
        current_page: Number(page),
        total_records: withdrawCount,
        total_pages: Math.ceil(withdrawCount / limit),
    });
}));

//Withdraw Details
router.get('/withdraw/:id', catchAsyncAction(async (req, res) => {
    const withdrawDetails = await findWithdrawDetails({ _id: req.params.id });
    return makeResponse(res, SUCCESS, true, FETCH_USER, withdrawDetails);
}));

//Update Withdraw Details
router.patch('/withdraw/:id', catchAsyncAction(async (req, res) => {
    const withdrawDetails = await updateWithdraw(req.body, { _id: req.params.id });
    return makeResponse(res, SUCCESS, true, FETCH_USER, withdrawDetails);
}));

//Result List
router.get('/result', catchAsyncAction(async (req, res) => {
    let searchingWithdraw = {
        isDeleted: false
    };
    let page = 1,
        limit = 10,
        skip = 0,
        status;
    if (req.query.status) status = req.query.status;
    if (req.query.page == 0) req.query.page = '';
    if (req.query.page) page = req.query.page;
    if (req.query.limit) limit = req.query.limit;
    skip = (page - 1) * limit;
    let regx;
    let searchFilter = req.query;
    if (searchFilter?.search) {
        regx = new RegExp(searchFilter?.search);
        searchingWithdraw = {
            isDeleted: false, $or: [{ 'firstName': { '$regex': regx, $options: 'i' } }]
        }
    };
    if (status) searchingWithdraw["status"] = status;
    console.log(searchingWithdraw);
    let withdrawRecords = await findAllLotteryResults(skip, limit, searchingWithdraw);
    const result = [];
    for (const item of withdrawRecords) {
        const festivalLottery = await findFestivalLotteryDetail({ _id: item.ticketId });
        const worldLottery = await findLotteryDetail({ _id: item?.ticketId });
        result.push({
            ticketDetails: festivalLottery ? festivalLottery : worldLottery,
            ...item._doc
        });
    }
    let withdrawCount = await findAllResultCount({ isDeleted: false });
    return makeResponse(res, SUCCESS, true, FETCH_USER, result, {
        current_page: Number(page),
        total_records: withdrawCount,
        total_pages: Math.ceil(withdrawCount / limit),
    });
}));

//Result Details
router.get('/result/:id', catchAsyncAction(async (req, res) => {
    const resultDetails = await findResultById({ _id: req.params.id });
    const festivalLottery = await findFestivalLotteryDetail({ _id: resultDetails.ticketId });
    const worldLottery = await findLotteryDetail({ _id: resultDetails?.ticketId });
    const result = {
        ticketDetails: festivalLottery ? festivalLottery : worldLottery,
        ...resultDetails?._doc
    };
    return makeResponse(res, SUCCESS, true, FETCH_USER, result);
}));

//Update Result Details
router.patch('/result/:id', catchAsyncAction(async (req, res) => {
    const resultDetails = await updateResult(req.body, { _id: req.params.id });
    return makeResponse(res, SUCCESS, true, FETCH_USER, resultDetails);
}));


//Add Result
router.post('/result', catchAsyncAction(async (req, res) => {
    const resultDetails = await addResult(req.body);
    return makeResponse(res, SUCCESS, true, FETCH_USER, resultDetails);
}));

//Users
router.get('/result-users', catchAsyncAction(async (req, res) => {
    const resultDetails = await findAllUsers();
    return makeResponse(res, SUCCESS, true, FETCH_USER, resultDetails);
}));

//Add Result
router.get('/result-lottery', catchAsyncAction(async (req, res) => {
    const resultDetails = await findAllLottery({ isDeleted: false });
    const festivalLottery = await findAllFestivalList({ isDeleted: false });
    const result = [...resultDetails, ...festivalLottery]
    return makeResponse(res, SUCCESS, true, FETCH_USER, result);
}));

// Fetch Chat List
router.get('/chat/list', catchAsyncAction(async (req, res) => {
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
    return makeResponse(res, SUCCESS, true, FETCH_USER, result);
}));

// Fetch Chat Details
router.get('/chat/:id', catchAsyncAction(async (req, res) => {
    console.log(req.params.id);
    if (req.params?.id) {
        const getRecord = await findChat({ 
            $or: [
                { 
                    senderId: req.params?.id 
                },
                {
                    receiverId: req.params?.id
                }
            ]
        });
        return makeResponse(res, SUCCESS, true, FETCH_USER, getRecord);
    }
    else {
        return makeResponse(res, SUCCESS, true, FETCH_USER, []);
    }
}));

export const adminController = router;
