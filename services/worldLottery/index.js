import { WorldLottery } from "../../models/lottery/index.js";
import QRCode from "qrcode";

//Find lottery by condition
export const findLottery = async (condition = {}) => WorldLottery.find(condition).exec();

//Find Lottery detail
export const findLotteryDetail = async (condition = {}) => await WorldLottery.findOne(condition).exec();

//Add Lottery
export const addLottery = async (payload = {}) => {
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
	// const QrCodeGenerator = await QRCode.toFile('lottery.png');
	console.log('wd');
	const newWorldlottery = new WorldLottery(payload);
	await QRCode.toFile(`./uploads/qrcode/${newFilename}`, `lottery`);
	return newWorldlottery.save();
};

//Update Lottery
export const updateLottery = (lotteryprops = {}, condition = {}) => new Promise((resolve, reject) => {
	WorldLottery.findOneAndUpdate(condition, { $set: lotteryprops }, { new: true })
		.then(resolve)
		.catch(reject);
});

//Delete Lottery
export const deleteLottery = (id) => new Promise((resolve, reject) => {
	WorldLottery.updateMany({ _id: { $in: id } }, { $set: { isDeleted: true } })
		.then(resolve)
		.catch(reject)
});

//Find all Lottery
export const findAllLottery = (search = {}, skip, limit) => new Promise((resolve, reject) => {
	WorldLottery.find(search)
		.skip(skip).limit(limit)
		.sort('-createdAt')
		.then(resolve)
		.catch(reject)
});
