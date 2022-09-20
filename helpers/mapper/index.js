export const userMapper = async(userprops) => {
    let { password, otp, ...rest } = userprops._doc;
    return rest;
};
