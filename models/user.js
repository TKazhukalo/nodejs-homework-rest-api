const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("./../helpers");
const Joi = require("joi");



const userSchema = new Schema({

  password: {
    type: String,
    required: [true, 'Set password for user'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  token: String,
  avatarURL: {
    type: String,
    required:true,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },

}, { versionKey: false, timestamps: true });

userSchema.post("save", handleMongooseError);

const registerSchema = Joi.object({
    password:Joi.string().min(6).required(),
    email:Joi.string().email().required(),

})

const emailSchema = Joi.object({
   email:Joi.string().email().required(),
})

const loginSchema = Joi.object({
    password:Joi.string().min(6).required(),
    email:Joi.string().email().required(),

})

const schemas = {
    registerSchema,
    loginSchema,
}

const User = model("user", userSchema);

module.exports = {
    User,
    schemas,
    emailSchema
}