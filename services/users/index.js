import { Payment, User } from '../../models/index.js';

//Find user by mobile
export const userProfile = async (condition = {}) => User.findOne(condition).exec();

//Find user detail
export const findUserDetail = async (condition = {}) => await User.findOne(condition).exec();

//Add user
export const addUser = async (payload = {}) => {
	let user = new User(payload);
	return user.save();
};

//Find user detail
export const findUserById = async (search = {}) => {
	let userRecord = await User.findOne(search).select('-password')
	if (userRecord && userRecord != null) return userRecord;
	else return {};
};

//Update user
export const updateUser = (userprops = {}, condition = {}) => new Promise((resolve, reject) => {
	User.findOneAndUpdate(condition, { $set: userprops }, { new: true })
		.then(resolve)
		.catch(reject);
});

//Delete user
export const deleteUser = (id) => new Promise((resolve, reject) => {
	User.updateMany({ _id: { $in: id } }, { $set: { isDeleted: true } })
		.then(resolve)
		.catch(reject)
});

//Find all users
export const findAllUsers = (search = {}, skip, limit) => new Promise((resolve, reject) => {
	User.find(search).select('-password -otp')
		.skip(skip).limit(limit)
		.sort('-createdAt')
		.then(resolve)
		.catch(reject)
});

//Get count
export const getUsersCount = (search) => new Promise((resolve, reject) => {
	User.count(search)
		.then(resolve)
		.catch(reject)
});

//Change status
export const changeStatus = (_id, data) => new Promise((resolve, reject) => {
	User.updateOne({ _id: _id }, data)
		.then(resolve)
		.catch(reject);
});

//Find All users
export const findAllLotteryUsers = async (search = {}) => {
	const paymentRecords = await Payment.find(search).select('user_id');
	const userMapper = paymentRecords.map(item => item?.user_id?.toHexString());
	const filterUserId = [...new Set(userMapper)];
	return filterUserId;
};

// Find All Lotery Tickets
export const findAllPurchasedLotteryTikets = async (search = {}) => {
	return await Payment.find(search);
};
