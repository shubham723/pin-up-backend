import mongoose from "mongoose";

const wordLotterySchema = mongoose.Schema({
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
    totalPrice: {
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
