import { FestivalLottery } from "../../models/index.js";

//Find lottery by condition
export const findFestivalLottery = async (condition = {}) => FestivalLottery.find(condition).exec();

//Find Lottery detail
export const findFestivalLotteryDetail = async (condition = {}) => await FestivalLottery.findOne(condition).exec();

//Add Lottery
export const addFestivalLottery = async (payload = {}) => {
	let fileName = '';
    const characters = 'Lottery';
    const charactersLength = characters.length;
    const length = 5;
	console.log('ewfe')
    for (var i = 0; i < length; i++) {
        fileName += characters.charAt(Math.floor(Math.random() * charactersLength));
    };
    const qrCodeName = fileName;
	console.log('ef')
	const newFilename = `bezkoder-${qrCodeName}-${Date.now()}.png`;
	payload.qrCode = `uploads/qrcode/${newFilename}`;
	const newFestivallottery = new FestivalLottery(payload);
	return newFestivallottery.save();
};

//Update Lottery
export const updateFestivalLottery = (lotteryprops = {}, condition = {}) => new Promise((resolve, reject) => {
	FestivalLottery.findOneAndUpdate(condition, { $set: lotteryprops }, { new: true })
		.then(resolve)
		.catch(reject);
});

//Delete Lottery
export const deleteFestivalLottery = (id) => new Promise((resolve, reject) => {
	FestivalLottery.updateMany({ _id: { $in: id } }, { $set: { isDeleted: true } })
		.then(resolve)
		.catch(reject)
});

//Find all Lottery
export const findAllFestivalLottery = (search = {}, skip, limit) => new Promise((resolve, reject) => {
	FestivalLottery.find(search)
		.skip(skip).limit(limit)
		.sort('-createdAt')
		.then(resolve)
		.catch(reject)
});
