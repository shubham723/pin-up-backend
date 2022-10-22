import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
    senderId: {
        // type: mongoose.Schema.ObjectId,
        // ref: 'User'
        type: String
    },
    message: {
        type: String
    },
    isGuest: {
        type: Boolean,
        default: false
    },
    senderType: {
        type: String,
        enums: ['ADMIN', 'USER', 'GUEST']
    }
}, {
    timestamps: true
});

export const Chat = mongoose.model('Chat', chatSchema);
