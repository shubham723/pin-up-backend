import mongoose from "mongoose";

const resultSchema = mongoose.Schema({
    ticketNumber: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    ticketId: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export const Result = mongoose.model('Result', resultSchema);
