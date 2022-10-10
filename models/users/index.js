import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import config from "config";

const userSchema = mongoose.Schema({
    otp: {
        type: Number,
    },
    firstName: {
        type: String,
        // required: true
    },
    lastName: {
        type: String,
        // required: true
    },
    fullName: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE', 'OTHER']
    },
    date_of_birth: {
        type: String
    },
    postCode: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    mobileNumber: {
        type: String
    },
    walletBalance: {
        type: Number
    },
    winAmount: {
        type:Number
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

userSchema.methods.generateAuthToken = function (_id, interested_in) {
    return jwt.sign({ id: _id, role: 'user', interested_in }, config.get("privateKey"), { expiresIn: '15d' });
};

userSchema.methods.generateRefershToken = function (_id, interested_in) {
    return jwt.sign({ id: _id, role: 'user', interested_in }, config.get("privateKey"), { expiresIn: '30d' });
};

export const User = mongoose.model('User', userSchema);
