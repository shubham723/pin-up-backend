import { Mult } from '../../models/index.js';

//Find mult detail
export const findMultDetail = async (condition = {}) => await Mult.findOne(condition).exec();

//Add mult
export const addMult = async (payload = {}) => {
	const mult = new Mult(payload);
	return mult.save();
};

//Find mult
export const findMult = async (search = {}) => {
	const multRecord = await Mult.find(search).limit(30).sort('-createdAt');
    if (multRecord?.length > 0) return multRecord;
    else return []
};
