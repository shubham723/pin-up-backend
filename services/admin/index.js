import { Admin, FestivalLottery, Payment, Result, User, WorldLottery } from '../../models/index.js';

//Find admin
export const adminProfile = async (condition = {}) => Admin.findOne(condition).exec();

//Find user detail
export const findAdminDetail = async (condition = {}) => await Admin.findOne(condition).exec();

//Add user
export const addAdmin = async (payload = {}) => {
	let admin = new Admin(payload);
	return admin.save();
};

//Find user detail
export const findAdminById = async (search = {}) => {
	let userRecord = await Admin.findOne(search).select('-password')
	if (userRecord && userRecord != null) return userRecord;
	else return {};
};

//Update user
export const updateAdmin = (adminprops = {}, condition = {}) => new Promise((resolve, reject) => {
	Admin.findOneAndUpdate(condition, { $set: adminprops }, { new: true })
		.then(resolve)
		.catch(reject);
});

//Delete user
export const deleteAdmin = (id) => new Promise((resolve, reject) => {
	Admin.updateMany({ _id: { $in: id } }, { $set: { isDeleted: true } })
		.then(resolve)
		.catch(reject)
});

// Find Users
export const findAllUsersList = async (skip, limit, search = {}) => {
	delete search.limit;
	delete search.page;
	return await User.find(search).select('-password -otp')
		.skip(skip).limit(Number(limit))
		.sort('-createdAt')
		.exec()
};

// Find User
export const userDetail = async (search = {}) => await User.findOne(search).select('-password -otp').exec();

// Update Users
export const updateUserDetail = async (condition = {}, userprops = {}) => await User.findOneAndUpdate(condition, { $set: userprops }, { new: true });

// Users count
export const findAllUsersCount = async (search) => await User.countDocuments(search).exec();

// Find World Lottery
export const findAllWorldLottery = async (skip, limit, search = {}) => {
	delete search.limit;
	delete search.page;
	return await WorldLottery.find(search).select('-password -otp')
		.skip(skip).limit(Number(limit))
		.sort('-createdAt')
		.exec()
};

// Find World Lottery
export const worldLotteryDetail = async (search = {}) => await WorldLottery.findOne(search).exec();

// Update World Lottery
export const updateWorldLotteryDetail = async (condition = {}, lotteryprops = {}) => await WorldLottery.findOneAndUpdate(condition, { $set: lotteryprops }, { new: true });

// World Lottery count
export const findAllWorldLotteryCount = async (search) => await WorldLottery.countDocuments(search).exec();

// Find Festival Lottery
export const findAllFestivalList = async (skip, limit, search = {}) => {
	delete search.limit;
	delete search.page;
	return await FestivalLottery.find(search)
		.skip(skip).limit(Number(limit))
		.sort('-createdAt')
		.exec()
};

// Find Festival Lottery
export const festivalLotteryDetail = async (search = {}) => await FestivalLottery.findOne(search).exec();

// Update Festival Lottery
export const updateFestivalLotteryDetail = async (condition = {}, lotteryprops = {}) => await FestivalLottery.findOneAndUpdate(condition, { $set: lotteryprops }, { new: true });

// World Festival count
export const findAllFestivalLotteryCount = async (search) => await FestivalLottery.countDocuments(search).exec();

// Payments count
export const findAllPaymentCounts = async (search) => await Payment.countDocuments(search).exec();

// Find All Payments
export const findAllPaymentList = async (skip, limit, search = {}) => {
	delete search.limit;
	delete search.page;
	return await Payment.find(search).populate({
		path: 'user_id',
		select: 'fullName email mobileNumber'
		})
		.skip(skip).limit(Number(limit))
		.sort('-createdAt')
		.exec()
};

// Find Payment Details
export const findPaymentDetails = async (search = {}) => {
	return await Payment.findOne(search).populate({
		path: 'user_id',
		select: 'fullName email mobileNumber'
	}).exec()
};

// Find Lottery Results
export const findAllLotteryResults = async (skip, limit, search = {}) => {
	delete search.limit;
	delete search.page;
	return await Result.find(search).populate({
		path: 'userId',
		select: '-password'
	})
		.skip(skip).limit(Number(limit))
		.sort('-createdAt')
		.exec()
};

// Result Lottery count
export const findAllResultCount = async (search) => await Result.countDocuments(search).exec();
