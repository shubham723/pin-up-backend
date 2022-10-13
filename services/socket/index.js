import { findUserById, updateUser } from "../users/index.js";

const Socket = (io) => {
    const users = [];
    let currentUserId;
    io.on('connection', async socket => {
        socket.on('user_connected', async ({ userId }) => {
            const currentUserIndex = users.findIndex(item => item.id === currentUserId);
            if (currentUserIndex === -1 && userId) {
                currentUserId = userId;
                const userDetail = await findUserById({ _id: userId });
                users.push({
                    name: userDetail?.fullName,
                    id: userDetail?._id?.toHexString(),
                    isPlaying: false,
                    isWin: false
                });
                socket.join(userId);
            }
            else {
                socket.join(socket.id);
            }
            socket.emit('playing_users', users);
        });

        socket.on('disconnect', () => {
            if (currentUserId) {
                const currentUserIndex = users.findIndex(item => item.id === currentUserId);
                users.splice(currentUserIndex, 1);
                socket.leave(currentUserId);
                socket.emit('playing_users', users);
            }
            else {
                socket.leave(socket.id);
            }
        });

        socket.on('set_time', async (payload) => {
            io.emit('get_time', payload);
        });

        socket.on('bet', async (payload) => {
            const currentUserIndex = users.findIndex(item => item.id === currentUserId);
            if (currentUserIndex != -1) {
                const currentUserDetail = users[currentUserIndex];
                const { isPlaying = false, ...rest } = currentUserDetail;
                const updateBetDetails = {
                    bet: payload?.price,
                    isPlaying: payload?.isPlaying,
                    ...rest
                };
                console.log(updateBetDetails);
                users[currentUserIndex] = updateBetDetails;
                io.emit('playing_users', users);
            }
        });

        socket.on('bet_done', async (payload) => {
            console.log('called', payload)
            const currentUserIndex = users.findIndex(item => item.id === currentUserId);
            if (currentUserIndex != -1) {
                const currentUserDetail = users[currentUserIndex];
                console.log('currentUserDetail', currentUserDetail);
                if (currentUserDetail.isPlaying && (payload.isWin || (!currentUserDetail.isWin && !payload.isWin))) {
                    console.log('if case');
                    const userRecord = await findUserById({ _id: currentUserDetail.id });
                    let wallet = userRecord?.walletBalance || 0;
                    let currentWinAmount = userRecord?.winAmount || 0;
                    // console.log('currentUserDetail', userRecord)
                    if (currentUserDetail.isPlaying) {
                        wallet = Number(Number(wallet) - Number(payload.price)).toFixed(2);
                        currentWinAmount = Number(Number(currentWinAmount) - Number(payload.price));
                    }
                    console.log('wd;', wallet);
                    if (payload.isWin) {
                        let winAmountOfGame = Number(Number(payload.price) * Number(payload.mult));
                        currentWinAmount = Number(Number(winAmountOfGame) + Number(currentWinAmount)).toFixed(2);
                        wallet = Number(Number(wallet) + Number(winAmountOfGame)).toFixed(2);
                    }
                    console.log('wallet>>>', wallet, currentWinAmount)
                    const updateBalance = await updateUser({ walletBalance: wallet, winAmount: currentWinAmount }, { _id: userRecord._id });
                    const { bet = 0, mult = 0, isPlaying = false, isWin = false, balance = 0, ...rest } = currentUserDetail;
                    const updateBetDetails = {
                        bet: payload?.price,
                        mult: payload?.mult,
                        isPlaying: false,
                        isWin: payload?.isWin,
                        balance: updateBalance?.walletBalance || 0,
                        ...rest
                    };
                    console.log('updateBetDetails', updateBetDetails);
                    users[currentUserIndex] = updateBetDetails;
                    console.log('after', users);
                    io.emit('playing_users', users);
                }
                else {
                    const { isWin = false, isPlaying = false, ...rest } = currentUserDetail;
                    const updateBetDetails = {
                        isWin: false,
                        isPlaying: false,
                        ...rest
                    };
                    console.log('other case', updateBetDetails);
                    users[currentUserIndex] = updateBetDetails;
                }
            }
        });
    })
};

export { Socket };
