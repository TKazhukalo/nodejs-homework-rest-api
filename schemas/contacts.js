const Joi = require("joi");

const addSchema = Joi.object({
    name: Joi.string().trim().min(2).pattern(/^[a-zA-Zа-яА-Я\s\-']+$/).required(),
    email: Joi.string().email().required(),
    phone:Joi.string().required().pattern(/^\d{10}$/),
})

module.exports = {
    addSchema,
}