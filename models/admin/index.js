import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import config from "config";

const adminSchema = mongoose.Schema({
    otp: {
        type: Number,
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

adminSchema.methods.generateAuthToken = function (_id, interested_in) {
    return jwt.sign({ id: _id, role: 'admin', interested_in }, config.get("privateKey"), { expiresIn: '15d' });
};

adminSchema.methods.generateRefershToken = function (_id, interested_in) {
    return jwt.sign({ id: _id, role: 'admin', interested_in }, config.get("privateKey"), { expiresIn: '30d' });
};

export const Admin = mongoose.model('Admin', adminSchema);
