import { findUserById } from "../users/index.js";

const Socket = (io) => {
    console.log('ewe');
    const users = [];
    let currentUserId;
    io.on('connection', async socket => {
        console.log('**');
        socket.on('user_connected', async ({ userId }) => {
            console.log(userId);
            currentUserId = userId;
            const userDetail = await findUserById({ _id: userId });
            console.log(userDetail);
            users.push({
                name: userDetail?.fullName,
                id: userDetail?._id?.toHexString()
            });
            // users[userId] = userDetail);
            console.log(users);
            socket.join(userId);
        });

        socket.on('disconnect', () => {
            socket.leave(currentUserId);
        });

        socket.on('set_time', async (payload) => {
            console.log(payload);
            console.log(users);
            io.emit('get_time', payload);
        });

        socket.on('bet', async (payload) => {
            const currentUserIndex = users.findIndex(item => item.id === currentUserId);
            const currentUserDetail = users[currentUserIndex];
            console.log('currentUserDetail', currentUserDetail);
            const updateBetDetails = {
                bet: payload?.price,
                mult: payload?.mult,
                isPlaying: true,
                ...currentUserDetail
            };
            console.log(updateBetDetails);
            console.log(users);
            users[currentUserIndex] = updateBetDetails;
            console.log('after', users);
            io.emit('playing_users', users);
        });
    })
};

export { Socket };
