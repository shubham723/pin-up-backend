import { Withdraw } from '../../models/index.js';

//Find withdraw
export const findWithdrawDetails = async (condition = {}) => Withdraw.findOne(condition).exec();

//Add Withdraw
export const addWithdraw = async (payload = {}) => {
	let withdraw = new Withdraw(payload);
	return withdraw.save();
};

//Update Withdraw
export const updateWithdraw = (withdrawprops = {}, condition = {}) => new Promise((resolve, reject) => {
	Withdraw.findOneAndUpdate(condition, { $set: withdrawprops }, { new: true })
		.then(resolve)
		.catch(reject);
});

//Find all Withdraw
export const findAllWithdraw = (search = {}, skip, limit) => new Promise((resolve, reject) => {
	Withdraw.find(search)
		.skip(skip).limit(limit)
		.sort('-createdAt')
		.then(resolve)
		.catch(reject)
});

//Get count
export const getWithdrawCount = (search) => new Promise((resolve, reject) => {
	Withdraw.count(search)
		.then(resolve)
		.catch(reject)
});
