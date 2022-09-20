import axios from 'axios';
import { privateKey } from '../../config/privateKeys.js';

export const sendOtp = async (mobile) => new Promise((resolve, reject) => {
	const url = privateKey.baseUrl + '/' + privateKey.key + '/SMS/+91' + mobile + '/AUTOGEN';
	axios.post(url)
		.then(function (response) {
			resolve(response);
		})
		.catch(function (error) {
			reject(error);
		});
});

export const verifyOtp = async (sessionId, otp) => new Promise((resolve, reject) => {
	const url = privateKey.baseUrl + '/' + privateKey.key + '/SMS/VERIFY/' + sessionId + '/' + otp;
	axios.post(url)
		.then(function (response) {
			resolve(response);
		})
		.catch(function (error) {
			reject(error);
		});
});

export const generateOtp = () => {
	return Math.floor((Math.random() + 1) * 1000);
};
