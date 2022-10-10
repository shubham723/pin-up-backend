import mongoose from "mongoose";

const withdrawSchema = mongoose.Schema({
    method: {
        type: String,
        enum: ['UPI', 'BANK']
    },
    accountNumber: {
        type: String,
    },
    accountName: {
        type: String,
    },
    ifscCode: {
        type: String
    },
    upiId: {
        type: String
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'COMPLETED'],
        default: 'PENDING'
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    withdrawAmount: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const Withdraw = mongoose.model('Withdraw', withdrawSchema);
