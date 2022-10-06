import Router from 'express';
import Razorpay from 'razorpay';
import { makeResponse, responseMessages, statusCodes } from '../../helpers/index.js';
import shortid from 'shortid';
import crypto from 'crypto';
import fs from 'fs';
import { addPayment, findUserById, updatePayment, updateUser } from '../../services/index.js';
import { Payment } from '../../models/index.js';

//Response messages
const { SUCCESS_MESSAGE } = responseMessages.EN;
//Response status code
const { SUCCESS } = statusCodes;

const router = Router();

const razorpay = new Razorpay({
	key_id: 'rzp_test_PGZfCIkGBqVbcz',
	key_secret: 'b54RubUBDSHa8eIMdEFxP6EE'
});

// Payment Gateway
router.post('/', async (req, res) => {
	console.log(req.body);
	const payment_capture = 1
	const { amount = 0, type = "", userId = "", ticketId = "", ticketNumber = "" } = req.body;
	const currency = 'INR'

	const options = {
		amount: Number(amount) * 100,
		currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options);
        const paymentprops = {
            amount,
            currency,
            receipt: options.receipt,
            order_id: response.id,
			type,
			user_id: userId,
			festivalTicketId: ticketId,
			ticketNumber
        };
        const pay = await addPayment(paymentprops);
		console.log(pay);
        return makeResponse(res, SUCCESS, true, SUCCESS_MESSAGE, {
			id: response.id,
			currency: response.currency,
			amount: response.amount
		});
	} catch (error) {
		console.log(error)
	}
});

// Webhook
router.post('/verification', async (req, res) => {
	// do a validation
	const secret = '12345678'

	console.log(req.body.event)
    console.log(req.body.payload.payment.entity)

    const { mehtod = "", status = "", order_id = "" } = req.body?.payload?.payment?.entity;

	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body));
	const digest = shasum.digest('hex');
	const paymentRecord = await Payment.findOne({ order_id });

	console.log(paymentRecord)

	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit')
		// process it
        const paymentprops = {
            mehtod,
            status: status === 'captured' ? 'SUCCESS' : 'FAILED'
        }
        await updatePayment(paymentprops, { order_id });
		console.log('paymentRecord', paymentRecord);
		if (paymentRecord?.type === "AVIATOR" && paymentprops.status === "SUCCESS") {
			const userRecord = await findUserById({ _id: paymentRecord.user_id });
			console.log('userRecord', userRecord);
			const amount = userRecord?.walletBalance || 0;
			const updatedAmount = Number(amount) + Number(paymentRecord.amount);
			console.log(updatedAmount);
			await updateUser({ walletBalance: updatedAmount }, { _id: userRecord._id });
		}
		fs.writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))
	} else {
		// pass it
	}
	res.json({ status: 'ok' })
});


export const paymentController = router;
