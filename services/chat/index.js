import { Chat } from '../../models/index.js';

//Find chat detail
export const findChat = async (condition = {}) => await Chat.find(condition).sort('+createdAt').exec();

//Add Chat
export const addChat = async (payload = {}) => {
	let chat = new Chat(payload);
	return chat.save();
};

// Find Chat List
export const chatList = async () => {
    let messageRecord = await Chat.aggregate([
        {
            $match: {
                $or: [
                    { senderType: 'USER' },
                    { senderType: 'GUEST' }
                    // {
                    //     $or: [
                    //         { senderId: new mongoose.Types.ObjectId(id) },
                    //         { recieverId: new mongoose.Types.ObjectId(id) }
                    //     ]

                    // }
                ]
            },
        },
        {
            $group: {
                _id: "$senderId",
                senderId: { $last: "$senderId" },
                message: { $last: "$message" },
                receiverId: { $last: "$receiverId" },
                senderType: { $last: "$senderType" },
                id: { $last: "$_id" },
                isGuest: { $last: "$isGuest" }
            },
        },
        {
            $sort: { _id: -1 }
        }
    ]).exec();
    return messageRecord;
    // if (messageRecord.length > 0) return messageRecord.reduce((unique, item) => {
    //     if (!unique.some(obj => obj.senderId?.toHexString() == item.receiverId?.toHexString())) unique.push(item);
    //     return unique;
    // }, []);
    // else return [];
};
