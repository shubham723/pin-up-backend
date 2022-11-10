import { addChat } from "../chat/index.js";
import { addMult, findMult } from "../mult/index.js";
import { findUserById, updateUser } from "../users/index.js";

const Socket = (io) => {
    const users = [];
    const dummyUsers = [];
    let currentUserId;

    io.on('connection', async socket => {

        socket.on('user_connected', async (payload) => {
            console.log('users', users);
            console.log('paylod', payload);
            if (payload?.type === "admin") {
                currentUserId = "admin";
                socket.join(currentUserId);
            }
            else {
                const { userId = null } = payload;
                const currentUserIndex = users.findIndex(item => item.id == userId);
                console.log('currentUserIndex', currentUserIndex);
                if (userId) {
                    if (currentUserIndex === -1) {
                        currentUserId = userId;
                        const userDetail = await findUserById({ _id: userId });
                        const user = {
                            name: userDetail?.fullName,
                            id: userDetail?._id?.toHexString(),
                            isPlaying: false,
                            isWin: false,
                            game: [],
                            socket: socket.id
                        }
                        users.push(user);
                        // global.socket = socket;
                        // global.io = io;
                        socket.join(socket.id);
                        io.to(socket.id).emit('user_joined', user);
                    }
                }
                else {
                    console.log('else');
                    const currentUserIndex = dummyUsers.findIndex(item => item.socket == socket.id);
                    currentUserId = socket.id;
                    if (currentUserIndex === -1) {
                        socket.join(socket.id);
                        console.log('>>>', socket.id);
                        const dummyUser = {
                            name: 'Guest',
                            id: socket.id,
                            isPlaying: false,
                            isWin: false,
                            game: [],
                            socket: socket.id,
                            wallet: 3000,
                            isDummyUser: true
                        }
                        dummyUsers.push(dummyUser);
                        io.to(socket.id).emit('user_joined', dummyUser);

                    }
                }
                console.log('users', users);
                socket.emit('playing_users', users);
            }
        });

        socket.on('disconnect', () => {
            console.log('calledddd', dummyUsers, socket.id);
            // if (currentUserId) {
            //     // const currentUserIndex = users.findIndex(item => item.id === currentUserId);
            //     // users.splice(currentUserIndex, 1);
            //     socket.leave(socket.id);
            //     socket.emit('playing_users', users);
            // }
            // else {
            const currentDummyUserIndex = dummyUsers.findIndex(item => item.socket === socket.id);
            console.log(currentDummyUserIndex);
            const currentUserIndex = users.findIndex(item => item.socket === socket.id);
            if (currentDummyUserIndex != -1) {
                dummyUsers.splice(currentDummyUserIndex, 1);
            }
            if (currentUserIndex != -1) {
                users.splice(currentUserIndex, 1);
            }
            socket.leave(socket.id);
            // }
        });

        socket.on('set_time', async (payload) => {
            io.emit('get_time', payload);
        });

        socket.on('bet', async (payload) => {
            console.log('payload-bet', payload);
            // console.log('users', users);
            // console.log('currentUserId', currentUserId);
            console.log('socketId', payload?.game);

            if (payload?.isDummyUser) {
                const currentUserIndex = dummyUsers.findIndex(item => item.socket === payload?.socketId);
                console.log('dummy>>>>', currentUserIndex);
                if (currentUserIndex != -1) {
                    const currentUserDetail = dummyUsers[currentUserIndex];
                    const { isPlaying = false } = currentUserDetail;
                    const currentGame = dummyUsers[currentUserIndex]?.game || [];
                    for (const item of payload?.game) {
                        const { price, isPlaying, set, ...rest } = item;
                        currentGame[set - 1] = {
                            bet: price,
                            isPlaying,
                            set,
                            ...rest
                        };
                    }
                    dummyUsers[currentUserIndex].game = currentGame;
                    dummyUsers[currentUserIndex].isPlaying = isPlaying;
                    console.log('dummyUser>>>>', dummyUsers);
                    console.log('users', dummyUsers[0]?.game, dummyUsers[1]?.game);
                    io.emit("playing_demo_users", dummyUsers);
                }
            }
            else {
                const currentUserIndex = users.findIndex(item => item.socket === payload?.socketId);
                console.log('currentUserIndex', currentUserIndex);
                if (currentUserIndex != -1) {
                    const currentUserDetail = users[currentUserIndex];
                    const { isPlaying = false } = currentUserDetail;
                    const currentGame = users[currentUserIndex]?.game || [];
                    for (const item of payload?.game) {
                        const { price, isPlaying, set, ...rest } = item;
                        currentGame[set - 1] = {
                            bet: price,
                            isPlaying,
                            set,
                            ...rest
                        };
                    }
                    users[currentUserIndex].game = currentGame;
                    users[currentUserIndex].isPlaying = isPlaying;
                    io.emit('playing_users', users);
                    console.log('users>>>>', users);
                    console.log('users', users[0]?.game, users[1]?.game);
                }

            }
        });

        socket.on('bet_done', async (payload = {}) => {
            console.log('pay?>>>>LLL calleddd', payload);
            if (payload?.isDummyUser) {
                const currentDummyUserIndex = dummyUsers.findIndex(item => item.socket === payload?.socketId);
                console.log('currentDummyUserIndex', currentDummyUserIndex);
                if (currentDummyUserIndex != -1) {
                    const currentUserDetail = dummyUsers[currentDummyUserIndex];
                    const currentGame = currentUserDetail?.game || [];
                    for (const item of payload?.result) {
                        const currentGameStats = currentGame.findIndex(val => val?.set == item?.set);
                        console.log('currentGame', currentGame);
                        if (currentGameStats != -1) {
                            if (currentGame[currentGameStats]?.isPlaying && (item?.isWin || (!item.isWin && currentGame[currentGameStats]?.isPlaying))) {
                                // console.log('if case');
                                // const userRecord = await findUserById({ _id: currentUserDetail.id });
                                let wallet = currentUserDetail?.wallet || 0;
                                // let currentWinAmount = userRecord?.winAmount || 0;
                                // console.log('wallet', wallet)
                                // if (currentUserDetail.isPlaying) {
                                wallet = Number(Number(wallet) - Number(item.price)).toFixed(2);
                                // currentWinAmount = Number(Number(currentWinAmount) - Number(item.price));
                                // }
                                console.log('wd;', wallet);
                                console.log('item', item);
                                if (item.isWin) {
                                    let winAmountOfGame = Number(Number(item.price) * Number(item.mult));
                                    // currentWinAmount = Number(Number(winAmountOfGame) + Number(currentWinAmount)).toFixed(2);
                                    wallet = Number(Number(wallet) + Number(winAmountOfGame)).toFixed(2);
                                }
                                // console.log('wallet>>>', wallet)
                                // const updateBalance = await updateUser({ walletBalance: wallet, winAmount: currentWinAmount }, { _id: userRecord._id });
                                // const updateBalance = wallet;
                                const { isPlaying = false, isWin = false, balance = 0, game = [], set = null, wallet: walletBalance = 0, ...rest } = currentUserDetail;
                                const updateGameDetail = [...currentGame];
                                // console.log('detailssss', updateGameDetail);
                                if (updateGameDetail[currentGameStats]?.isPlaying) {
                                    updateGameDetail[currentGameStats].isPlaying = false;
                                }
                                const updateBetDetails = {
                                    // bet: payload?.price,
                                    // mult: payload?.mult,
                                    isPlaying: false,
                                    game: updateGameDetail,
                                    // isWin: payload?.isWin,
                                    balance: Number(wallet),
                                    wallet: Number(wallet),
                                    ...rest
                                };
                                // console.log('updateBetDetails', updateBetDetails);
                                dummyUsers[currentDummyUserIndex] = updateBetDetails;
                                // io.emit('playing_users', users);
                                io.to(socket.id).emit('update_balance', updateBetDetails);
                                io.emit("playing_demo_users", dummyUsers);
                                // console.log('>>', dummyUsers);
                                // console.log('wef', dummyUsers[0]?.game);
                            }

                            if (!item?.isWin) {
                                io.to(socket.id).emit('auto_check', {});
                            }
                        }
                    }
                }
            }
            else {
                const currentUserIndex = users.findIndex(item => item.socket === payload?.socketId);
                if (currentUserIndex != -1) {
                    const currentUserDetail = users[currentUserIndex];
                    const currentGame = currentUserDetail?.game || [];
                    for (const item of payload?.result) {
                        const currentGameStats = currentGame.findIndex(val => val?.set == item?.set);
                        if (currentGameStats != -1) {
                            if (currentGame[currentGameStats]?.isPlaying && (item?.isWin || (!item.isWin && currentGame[currentGameStats]?.isPlaying))) {
                                // console.log('if case');
                                const userRecord = await findUserById({ _id: currentUserDetail.id });
                                let wallet = userRecord?.walletBalance || 0;
                                let currentWinAmount = userRecord?.winAmount || 0;
                                // console.log('currentUserDetail', userRecord) 
                                // if (currentUserDetail.isPlaying) {
                                wallet = Number(Number(wallet) - Number(item.price)).toFixed(2);
                                currentWinAmount = Number(Number(currentWinAmount) - Number(item.price));
                                // }
                                // console.log('wd;', wallet);
                                // console.log('item', item);
                                if (item.isWin) {
                                    let winAmountOfGame = Number(Number(item.price) * Number(item.mult));
                                    currentWinAmount = Number(Number(winAmountOfGame) + Number(currentWinAmount)).toFixed(2);
                                    wallet = Number(Number(wallet) + Number(winAmountOfGame)).toFixed(2);
                                }
                                // console.log('wallet>>>', wallet, currentWinAmount)
                                const updateBalance = await updateUser({ walletBalance: wallet, winAmount: currentWinAmount }, { _id: userRecord._id });
                                const { isPlaying = false, isWin = false, balance = 0, game = [], set = null, ...rest } = currentUserDetail;
                                const updateGameDetail = [...currentGame];
                                // console.log('detailssss', updateGameDetail);
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
                                // console.log('updateBetDetails', updateBetDetails);
                                users[currentUserIndex] = updateBetDetails;
                                io.emit('playing_users', users);
                            }


                            if (!item?.isWin) {
                                io.to(socket.id).emit('auto_check', {});
                            }
                        }
                    }
                }

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
            console.log('users', users);
            // if (payload?.loggedInUser) {
            await addChat(payload);
            // }
            let user;
            if (payload?.isGuestMessage) {
                user = payload?.senderId;
            }
            else if (payload?.senderType === "ADMIN") {
                const userIndex = users.findIndex(item => item?.id == payload.senderId);
                if (userIndex != -1) {
                    user = users[userIndex]?.socket;
                }
            }
            else {
                user = "admin"
            }
            console.log('user', user);
            socket.broadcast.to(user).emit('receive_message', payload);
        });

    });
};

export { Socket };
