const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("./../helpers");
const Joi = require("joi");

const contactSchema = new Schema({
      
  name: {
    type: String,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  }
}, { versionKey: false, timestamps: true });

contactSchema.post("save", handleMongooseError);

const addSchema = Joi.object({
    name: Joi.string().trim().min(2).pattern(/^[a-zA-Zа-яА-Я\s\-']+$/).required(),
    email: Joi.string().email().required(),
    phone:Joi.string().required().pattern(/^\d{10}$/),
    favorite:Joi.boolean(),
})

const updateFavoriteSchems = Joi.object({
    favorite:Joi.boolean().required(),
})

const schemas = {
    addSchema,
    updateFavoriteSchems,
}

const Contact = model("contact", contactSchema);

module.exports = {
    Contact,
    schemas,
}
