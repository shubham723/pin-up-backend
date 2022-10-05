import mongoose from "mongoose";

const paymentSchema = mongoose.Schema({
    amount: {
        type: String
    },
    currency: {
        type: String
    },
    receipt: {
        type: String
    },
    order_id: {
        type: String
    },
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enums: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
    method: {
        type: String,
        required: false
    },
    type: {
        type: String,
        enums: ['WORLDLOTTERY', 'FESTIVALLOTTERY', 'AVIATOR'],
        required: true
    },
    festivalTicketId: {
        type: String
    },
    ticketNumber: {
        type: String
    }
}, {
    timestamps: true
});

export const Payment = mongoose.model('Payment', paymentSchema);
