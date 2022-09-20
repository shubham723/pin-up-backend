import mongoose from "mongoose";

const festivalLotterySchema = mongoose.Schema({
    qrCode: {
        type: String,
    },
    ticketNumber: {
        type: String,
        // required: true
    },
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
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const FestivalLottery = mongoose.model('FestivalLottery', festivalLotterySchema);
