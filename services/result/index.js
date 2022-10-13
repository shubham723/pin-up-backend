import { Result } from '../../models/index.js';

//Find Result
export const findResult = async (condition = {}) => Result.find(condition).exec();

//Add Result
export const addResult = async (payload = {}) => {
	const result = new Result(payload);
	return result.save();
};

//Find Result detail
export const findResultById = async (search = {}) => {
	const resultRecord = await Result.findOne(search).populate({
		path: 'userId',
		select: '-password'
	});
	if (resultRecord && resultRecord != null) return resultRecord;
	else return {};
};

//Update Result
export const updateResult = (resultprops = {}, condition = {}) => new Promise((resolve, reject) => {
	Result.findOneAndUpdate(condition, { $set: resultprops }, { new: true })
		.then(resolve)
		.catch(reject);
});
