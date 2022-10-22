import { addChat } from "../chat/index.js";
import { addMult, findMult } from "../mult/index.js";
import { findUserById, updateUser } from "../users/index.js";

const Socket = (io) => {
    const users = [];
    let currentUserId;

    io.on('connection', async socket => {
        socket.on('user_connected', async (payload) => {
            if (payload?.type === "admin") {
                currentUserId = "admin";
                socket.join(currentUserId);
            }
            else {
                const { userId = null } = payload;
                console.log('called event', userId);
                const currentUserIndex = users.findIndex(item => item.id === currentUserId);
                if (userId) {
                    if (currentUserIndex === -1) {
                        currentUserId = userId;
                        const userDetail = await findUserById({ _id: userId });
                        users.push({
                            name: userDetail?.fullName,
                            id: userDetail?._id?.toHexString(),
                            isPlaying: false,
                            isWin: false,
                            game: []
                        });
                        socket.join(userId);
                    }
                }
                else {
                    currentUserId = socket.id;
                    socket.join(socket.id);
                    console.log(socket.id);
                    io.to(socket.id).emit('user_joined', socket.id);
                }
                socket.emit('playing_users', users);
            }
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
            console.log('done', payload);
            const currentUserIndex = users.findIndex(item => item.id === currentUserId);
            if (currentUserIndex != -1) {
                const currentUserDetail = users[currentUserIndex];
                const { isPlaying = false } = currentUserDetail;
                const currentGame = users[currentUserIndex]?.game || [];
                for (const item of payload) {
                    const { price, isPlaying, set, ...rest } = item;
                    currentGame[set - 1] = {
                        bet: price,
                        isPlaying,
                        set,
                        ...rest
                    };
                }
                // const updateBetDetails = {
                //     bet: payload?.price,
                //     isPlaying: payload?.isPlaying,
                //     ...rest
                // };
                console.log(currentGame);
                users[currentUserIndex].game = currentGame;
                users[currentUserIndex].isPlaying = isPlaying;
                console.log('usersssss', users);
                console.log(users[0].game);
                io.emit('playing_users', users);
            }
        });

        socket.on('bet_done', async (payload = {}) => {
            console.log('called>>>>>>>>>>>>>>>', payload)
            console.log('cond', users, currentUserId);
            const currentUserIndex = users.findIndex(item => item.id === currentUserId);
            console.log('currentUserIndex', currentUserIndex);
            if (currentUserIndex != -1) {
                const currentUserDetail = users[currentUserIndex];
                console.log('currentUserDetail', currentUserDetail);
                const currentGame = currentUserDetail?.game || [];
                // const filterCurrentGame = currentGame.filter(item => item?.isPlaying);
                console.log('currentGame', currentGame);
                for (const item of payload) {
                    const currentGameStats = currentGame.findIndex(val => val?.set == item?.set);
                    console.log('currentGameStats', currentGameStats);
                    if (currentGameStats != -1) {
                        if (currentGame[currentGameStats]?.isPlaying && (item?.isWin || (!item.isWin && currentGame[currentGameStats]?.isPlaying))) {
                            console.log('if case');
                            const userRecord = await findUserById({ _id: currentUserDetail.id });
                            let wallet = userRecord?.walletBalance || 0;
                            let currentWinAmount = userRecord?.winAmount || 0;
                            // console.log('currentUserDetail', userRecord) 
                            // if (currentUserDetail.isPlaying) {
                            wallet = Number(Number(wallet) - Number(item.price)).toFixed(2);
                            currentWinAmount = Number(Number(currentWinAmount) - Number(item.price));
                            // }
                            console.log('wd;', wallet);
                            if (item.isWin) {
                                let winAmountOfGame = Number(Number(item.price) * Number(item.mult));
                                currentWinAmount = Number(Number(winAmountOfGame) + Number(currentWinAmount)).toFixed(2);
                                wallet = Number(Number(wallet) + Number(winAmountOfGame)).toFixed(2);
                            }
                            console.log('wallet>>>', wallet, currentWinAmount)
                            const updateBalance = await updateUser({ walletBalance: wallet, winAmount: currentWinAmount }, { _id: userRecord._id });
                            const { isPlaying = false, isWin = false, balance = 0, game = [], set = null, ...rest } = currentUserDetail;
                            const updateGameDetail = [...currentGame];
                            console.log('detailssss', updateGameDetail);
                            if (updateGameDetail[currentGameStats]?.isPlaying) {
                                updateGameDetail[currentGameStats].isPlaying = false
                            }
                            const updateBetDetails = {
                                // bet: payload?.price,
                                // mult: payload?.mult,
                                isPlaying: false,
                                game: updateGameDetail,
                                // isWin: payload?.isWin,
                                balance: updateBalance?.walletBalance || 0,
                                ...rest
                            };
                            console.log('updateBetDetails', updateBetDetails);
                            users[currentUserIndex] = updateBetDetails;
                            console.log('after', users);
                            console.log(users[0]?.game);
                            io.emit('playing_users', users);
                        }

                    }
                }
                // for (const item of currentGame) {
                //     console.log('item', item);
                //     if (item?.isPlaying && (payload?.isWin || (!payload?.isWin && item?.isPlaying) )) {
                //     // if (currentUserDetail.isPlaying && (payload.isWin || (!currentUserDetail.isWin && !payload.isWin))) {
                //         console.log('if case');
                //         const userRecord = await findUserById({ _id: currentUserDetail.id });
                //         let wallet = userRecord?.walletBalance || 0;
                //         let currentWinAmount = userRecord?.winAmount || 0;
                //         // console.log('currentUserDetail', userRecord)
                //         // if (currentUserDetail.isPlaying) {
                //             wallet = Number(Number(wallet) - Number(payload.price)).toFixed(2);
                //             currentWinAmount = Number(Number(currentWinAmount) - Number(payload.price));
                //         // }
                //         console.log('wd;', wallet);
                //         if (payload.isWin) {
                //             let winAmountOfGame = Number(Number(payload.price) * Number(payload.mult));
                //             currentWinAmount = Number(Number(winAmountOfGame) + Number(currentWinAmount)).toFixed(2);
                //             wallet = Number(Number(wallet) + Number(winAmountOfGame)).toFixed(2);
                //         }
                //         console.log('wallet>>>', wallet, currentWinAmount)
                //         const updateBalance = await updateUser({ walletBalance: wallet, winAmount: currentWinAmount }, { _id: userRecord._id });
                //         const { isPlaying = false, isWin = false, balance = 0, game = [], set = null, ...rest } = currentUserDetail;
                //         const updateGameDetail = [...currentGame];
                //         console.log('detailssss', updateGameDetail, set);
                //         if (set) {
                //             updateGameDetail[set-1].isPlaying = false
                //         }
                //         const updateBetDetails = {
                //             // bet: payload?.price,
                //             // mult: payload?.mult,
                //             isPlaying: false,
                //             game: updateGameDetail,
                //             // isWin: payload?.isWin,
                //             balance: updateBalance?.walletBalance || 0,
                //             ...rest
                //         };
                //         console.log('updateBetDetails', updateBetDetails);
                //         users[currentUserIndex] = updateBetDetails;
                //         console.log('after', users);
                //         io.emit('playing_users', users);
                //     }
                //     else {
                //         const { isWin = false, isPlaying = false, ...rest } = currentUserDetail;
                //         const updateBetDetails = {
                //             isWin: false,
                //             isPlaying: false,
                //             ...rest
                //         };
                //         console.log('other case', updateBetDetails);
                //         users[currentUserIndex] = updateBetDetails;
                //     }
                // }
            }
        });

        socket.on('mult', async (payload) => {
            console.log('pay,,', payload);
            await addMult({ mult: payload });
            const multRecords = await findMult();
            io.emit('mult_details', multRecords);
        });

        socket.on('send_message', async (payload) => {
            console.log(payload);
            console.log(users);
            // if (payload?.loggedInUser) {
                await addChat(payload);
            // }
            socket.broadcast.to(payload?.userId).emit('receive_message', payload);
        });

    });
};

export { Socket };
