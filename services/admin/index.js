import { Admin } from '../../models/index.js';

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
