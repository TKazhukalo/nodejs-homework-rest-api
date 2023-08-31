
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const { User } = require("../models/user");
const { nanoid } = require("nanoid");

const Jimp = require("jimp");

const { HttpError } = require("../helpers");
const { ctrlWrapper,sendEmail } = require("../helpers");

const { SECRET_KEY,BASE_URL } = process.env;

const avatarDir=path.join(__dirname,"../","public", "avatars")

const register = async (req, res) => {
    const { email,password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();

    const newUser = await User.create({ ...req.body, password: hashPassword,avatarURL,verificationToken });
    
    const verifyEmail = {
        to: email, subject: "Verify email",
        html:`<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click verify email </a>`
    }
    await sendEmail(verifyEmail);

    res.status(201).json({
        email: newUser.email,
        password:newUser.password,
    })
}


const verifyEmail = async (req, res) => {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
        throw HttpError(404,"User not found")
    }
    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });

    res.status(200).json({
        message:"Verification successful"
    })
}

const resendVerifyEmail = async (req, res) => {
    const { email } = req.body;
     if (!email) {
        throw HttpError(400, "Missing required field: email");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(404, "User not found");
    }
    if (user.verify) {
        throw HttpError(400,"Verification has already been passed")
    }
    const verifyEmail = {
        to: email,
        subject: "Verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationToken}">Click verify email</a>`
    };
    await sendEmail(verifyEmail);

    res.json({
        message:"Verification email sent"
    })
}

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw HttpError(401, "Email or password is wrong");
    }

    if (!user.verify) {
        throw HttpError(400, "Email not verified");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Email or password is wrong");
    }
    const payload = {
        id: user._id,
    }
 const token = jwt.sign(payload, SECRET_KEY, {expiresIn: "23h"});
    await User.findByIdAndUpdate(user._id, { token });
    
    res.json({
        token,
    })
}

const getCurrent = async (req, res) => {
    const { email,subscription} = req.user;

    res.json({
        email,
        subscription,
    })
}

const logout = async (req, res) => {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.json({
        message:"Logout success",
    })
}

const updateSubscription = async (req, res) => {
    const { _id } = req.user;
    const { subscription } = req.body;

    if (!['starter', 'pro', 'business'].includes(subscription)) {
        throw HttpError(400, "Invalid subscription value");
    }

    await User.findByIdAndUpdate(_id, { subscription });

    res.json({
        message: "Subscription updated",
        subscription: subscription,
    });
}

const updateAvatar = async (req, res) => {
    const { _id } = req.user;
    const { path: tempUpload, originalname } = req.file;
    const filename = `${_id}_${originalname}`;
    const resultUpload = path.join(avatarDir, filename);
    const image = await Jimp.read(tempUpload);
    await image.resize(250, 250).write(resultUpload);
    const avatarURL = path.join("avatars", filename);
    await User.findByIdAndUpdate(_id, { avatarURL });

    res.status(200).json({
        avatarURL,
    })
}

module.exports = {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateSubscription: ctrlWrapper(updateSubscription),
    updateAvatar: ctrlWrapper(updateAvatar),
    verifyEmail: ctrlWrapper(verifyEmail),
    resendVerifyEmail:ctrlWrapper(resendVerifyEmail),
}