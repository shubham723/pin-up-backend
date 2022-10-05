import { Payment } from '../../models/index.js';

//Find Payment
export const findPayment = async (condition = {}) => Payment.find(condition).exec();

//Add Payment
export const addPayment = async (payload = {}) => {
	const payout = new Payment(payload);
	return payout.save();
};

//Find Payment detail
export const findPaymentById = async (search = {}) => {
	const paymentRecord = await Payment.findOne(search);
	if (paymentRecord && paymentRecord != null) return paymentRecord;
	else return {};
};

//Update Payment
export const updatePayment = (paymentprops = {}, condition = {}) => new Promise((resolve, reject) => {
	Payment.findOneAndUpdate(condition, { $set: paymentprops }, { new: true })
		.then(resolve)
		.catch(reject);
});
