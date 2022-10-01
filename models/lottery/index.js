import mongoose from "mongoose";

const wordLotterySchema = mongoose.Schema({
    qrCode: {
        type: String,
    },
    ticketId: {
        type: String,
        // required: true
    },
    ticketNumber: {
        type: [String]
    },
    price: {
        type: String,
        // required: true
    },
    drawDate: {
        type: String
    },
    winAmount: {
        type: String
    },
    name: {
        type: String
    },
    totalPrize: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const WorldLottery = mongoose.model('WorldLottery', wordLotterySchema);
