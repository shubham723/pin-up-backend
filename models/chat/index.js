import mongoose from "mongoose";

const chatSchema = mongoose.Schema({
    senderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
        // type: String
    },
    receiverId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
        // type: String
    },
    message: {
        type: String
    },
    senderType: {
        type: String,
        enums: ['ADMIN', 'USER']
    }
}, {
    timestamps: true
});

export const Chat = mongoose.model('Chat', chatSchema);
