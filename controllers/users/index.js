import Router from 'express';
import { privateKey } from '../../config/privateKeys.js';
import userAuth from '../../middlewares/auth/user.js';
import { catchAsyncAction, makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import {
    addUser,
    findUserById,
    findUserDetail,
    updateUser
} from '../../services/users/index.js';
import { generateOtp, hashPassword, matchPassword, sendEmail, verifyToken } from '../../services/index.js';
import { validators } from '../../middlewares/validations/index.js';
import { userMapper } from '../../helpers/mapper/index.js';
import config from "config";

//Response messages
const { USER_ADDED, LOGIN, OTP_MISMATCH, FETCH_USER, ALREADY_REGISTER, INVALID_EMAIL, PASSWORD_INVALID, VERIFY_OTP, OTP_FOR_PASSWORD, PASSWORD_REQUIRED, OTP_SENT, LOGOUT,
    PASSWORD_CHANGED, USER_NOTFOUND, UPDATE_USER, EMAIL_NOT_REGISTER, REFRESH_TOKEN, ALREADY_REPORT, ACCOUNT_DISABLED, FETCH_CATEGORIES, NOT_VERIFIED, SOCIAL_LOGIN, BLOCK_USER, REPORT_USER } = responseMessages.EN;
//Response status code
const { RECORD_CREATED, RECORD_ALREADY_EXISTS, SUCCESS, NOT_FOUND, AUTH_ERROR, BAD_REQUEST, FORBIDDEN } = statusCodes;

const router = Router();

//Add User
router.post('/', validators('ADD_USER'), catchAsyncAction(async (req, res) => {
    const { email } = req.body;
    const userRecord = await findUserDetail({ email });
    if (userRecord) return makeResponse(res, RECORD_ALREADY_EXISTS, false, ALREADY_REGISTER);
    //encrypt password
    const password = await hashPassword(req.body.password);
    if (password) req.body.password = password;
    const newUser = await addUser(req.body);
    //Genrate access token and Refresh token
    const accessToken = newUser.generateAuthToken(newUser._id);
    const refreshToken = newUser.generateRefershToken(newUser._id);
    //Delete fileds temporary from response
    const userDetail = await userMapper(newUser);
    return makeResponse(res, RECORD_CREATED, true, USER_ADDED, userDetail, { accessToken, refreshToken });
}));

//Login user
router.post('/login', validators('LOGIN'), catchAsyncAction(async (req, res) => {
    const { email, password } = req.body;
    const user = await findUserDetail({ email });
    if (!user) return makeResponse(res, NOT_FOUND, false, INVALID_EMAIL);
    if (user?.isDeleted == true || user?.status == false) return makeResponse(res, FORBIDDEN, false, ACCOUNT_DISABLED);
    const checkPassword = await matchPassword(password, user.password);
    if (!checkPassword) return makeResponse(res, AUTH_ERROR, false, PASSWORD_INVALID);
    const userDetail = await userMapper(user);
    //Genrate auth token
    const accessToken = user.generateAuthToken(user._id);
    const refreshToken = user.generateRefershToken(user._id);
    return makeResponse(res, SUCCESS, true, LOGIN, userDetail, { accessToken, refreshToken });
}));

//Forgot-password
router.post('/forgot-password', validators('FORGET_PASSWORD'), catchAsyncAction(async (req, res) => {
    const otp = generateOtp();
    const { email } = req.body;
    let user = await findUserDetail({ email });
    if (!user) throw new Error(EMAIL_NOT_REGISTER);
    else {
        await sendEmail({
            from: privateKey.email,
            to: req.body.email,
            subject: 'OTP for password reset',
            text: `The OTP for resetting your password is ${otp}`
        });
        await updateUser({ otp }, { email: req.body.email });
        return makeResponse(res, SUCCESS, true, OTP_FOR_PASSWORD);
    }
}));

//Verify OTP
router.post('/verify-otp', validators('VERIFY_OTP'), catchAsyncAction(async (req, res) => {
    const userData = await findUserById({ email: req.body.email });
    if (!userData) return makeResponse(res, NOT_FOUND, false, USER_NOTFOUND);
    if (userData.otp === req.body.otp) {
        const userDetail = await userMapper(userData);
        //Genrate auth token
        const accessToken = userData.generateAuthToken(userData._id);
        const refreshToken = userData.generateRefershToken(userData._id);
        return makeResponse(res, SUCCESS, true, VERIFY_OTP, userDetail, { accessToken, refreshToken });
    }
    return makeResponse(res, BAD_REQUEST, false, OTP_MISMATCH);
}));

//Reset Password
router.post('/reset-password', validators('RESET_PASSWORD'), catchAsyncAction(async (req, res) => {
    const userData = await findUserById({ email: req.body.email });
    if (!userData) return makeResponse(res, NOT_FOUND, false, USER_NOTFOUND);
    const password = await hashPassword(req.body.password);
    await updateUser({ password }, { email: req.body.email });
    return makeResponse(res, SUCCESS, true, PASSWORD_CHANGED);
}));


//Get user profile
router.get("/me", userAuth, (req, res) => {
    findUserById({ _id: req.userData.id })
        .then(async (user) => {
            //Delete fileds temporary from response
            delete user._doc.otp;
            delete user._doc.password;
            return makeResponse(
                res,
                SUCCESS,
                true,
                FETCH_USER,
                user
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

// Update User
router.patch('/', userAuth, catchAsyncAction(async (req, res) => {
    const getRecord = await findUserById({ _id: req.userData._id });
    if (!getRecord) return makeResponse(res, NOT_FOUND, false, NOT_FOUND);
    if (req.body.password) req.body.password = await hashPassword(req.body.password);
    const updateUserProfile = await updateUser(req.body, { _id: req.userData.id });
    //Delete fields temporary from response
    const userRecord = await userMapper(updateUserProfile);
    return makeResponse(res, SUCCESS, true, UPDATE_USER, userRecord);
}));

// Refersh Token
router.post('/refresh-token', validators('REFRESH_TOKEN'), catchAsyncAction(async (req, res, next) => {
    const decod = await verifyToken(req.body.refreshToken, config.get("privateKey"));
    const userData = await findUserById({ _id: decod.id });
    const accessToken = userData.generateAuthToken(userData._id);
    const refreshToken = userData.generateRefershToken(userData._id);
    return makeResponse(res, SUCCESS, true, REFRESH_TOKEN, { accessToken, refreshToken });
}));

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
            updateUser({ otp }, { email: req.body.email })

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

router.patch('/update/:id', catchAsyncAction(async(req, res) => {
    const getRecord = await findUserById({ _id: req.params.id });
    if (!getRecord) return makeResponse(res, NOT_FOUND, false, NOT_FOUND);
    if (req.body.password) req.body.password = await hashPassword(req.body.password);
    const updateUserProfile = await updateUser(req.body, { _id: req.params.id });
    //Delete fields temporary from response
    const userRecord = await userMapper(updateUserProfile);
    return makeResponse(res, SUCCESS, true, UPDATE_USER, userRecord);
}));

router.get('/user-details/:id', catchAsyncAction(async(req, res) => {
    const getRecord = await findUserById({ _id: req.params.id });
    if (!getRecord) return makeResponse(res, NOT_FOUND, false, NOT_FOUND);
    return makeResponse(res, SUCCESS, true, FETCH_USER, getRecord);
}));

router.get('/user-list', catchAsyncAction(async(req, res) => {
    const getRecord = await findAllUsers();
    if (!getRecord) return makeResponse(res, NOT_FOUND, false, NOT_FOUND);
    return makeResponse(res, SUCCESS, true, FETCH_USER, getRecord);
}));

export const usersController = router;
