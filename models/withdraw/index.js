import mongoose from "mongoose";

const withdrawSchema = mongoose.Schema({
    method: {
        type: String,
        enum: ['UPI', 'BANK']
    },
    accountNumber: {
        type: String,
        // required: true
    },
    accountName: {
        type: String,
        // required: true
    },
    ifscCode: {
        type: String
    },
    upiId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'COMPLETED'],
        default: 'PENDING'
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const Withdraw = mongoose.model('Withdraw', withdrawSchema);
