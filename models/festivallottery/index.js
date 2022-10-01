import mongoose from "mongoose";

const festivalLotterySchema = mongoose.Schema({
    qrCode: {
        type: String,
    },
    ticketId: {
        type: String,
        unique: true
        // required: true
    },
    ticketNumber: [String],
    price: {
        type: String,
        // required: true
    },
    drawDate: {
        type: String
    },
    priceAmount: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    winAmount: {
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

export const FestivalLottery = mongoose.model('FestivalLottery', festivalLotterySchema);
