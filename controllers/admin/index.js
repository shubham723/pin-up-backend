import Router from 'express';
import { privateKey } from '../../config/privateKeys.js';
import authAdmin from '../../middlewares/auth/admin.js';
import { catchAsyncAction, makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import { addAdmin, findAdminById, findAdminDetail, generateOtp, hashPassword, matchPassword, sendEmail, updateAdmin, verifyToken } from '../../services/index.js';
import { validators } from '../../middlewares/validations/index.js';
import { userMapper } from '../../helpers/mapper/index.js';
import config from "config";

//Response messages
const { USER_ADDED, LOGIN, OTP_MISMATCH, FETCH_USER, ALREADY_REGISTER, INVALID_EMAIL, PASSWORD_INVALID, VERIFY_OTP, OTP_FOR_PASSWORD, PASSWORD_REQUIRED, OTP_SENT, LOGOUT,
    PASSWORD_CHANGED, USER_NOTFOUND, EMAIL_NOT_REGISTER, ACCOUNT_DISABLED } = responseMessages.EN;
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

export const adminController = router;
