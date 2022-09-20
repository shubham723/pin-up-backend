import jwt from "jsonwebtoken";
import config from "config";
import { statusCodes, makeResponse, responseMessages } from '../../helpers/index.js';
import { findAdminById } from "../../services/index.js";

export default async function authAdmin(req, res, next) {
  //get the token from the header if present
  const token = req.headers["x-access-token"] || req.headers["authorization"];

  //if no token found, return response (without going to the next middelware)
  if (!token) return makeResponse(res, statusCodes.AUTH_ERROR, false, responseMessages.EN.UNAUTHORIZED);

  try {
    const decoded = jwt.verify(token, config.get("privateKey"));
    const adminRecord = await findAdminById({ _id: decoded.id });
    if (adminRecord && decoded.role === 'admin') {
      req.adminData = adminRecord;
      next();
    }
    else {
      return makeResponse(res, statusCodes.FORBIDDEN, false, responseMessages.EN.SUFFICIENT_RIGHTS);
    }
  } catch (error) {
    //if invalid token
    return makeResponse(res, statusCodes.FORBIDDEN, false, error.message);
  }
};
