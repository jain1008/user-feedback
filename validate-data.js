const Joi = require('@hapi/joi');
validateOrderFeedback = data => {
    const schema = {
        order_id: Joi.number().min(10).required(),
        user_id: Joi.number(),
        comment_id: Joi.string().required(),
        rating: Joi.number().required(),
        status: Joi.number().required(),
        feedback_by: Joi.number().required()
    }
    return  Joi.validate(data, schema);
}

validateProductComment = data => {
    const schema = {
        status: Joi.number().required(),
        product_type: Joi.number().required(),
        product_category: Joi.number().required()
    }
    return  Joi.validate(data, schema);
}

validateProductFeedback = data => {
    let data_ = Object.assign({}, data); 
    const schema = {
        order_id: Joi.number().min(10).required(),
        product_id: Joi.number().required(),
        user_id: Joi.number(),
        comment_id: Joi.string().required(),
        rating: Joi.number().required(),
        status: Joi.number().required(),
        feedback_by: Joi.number().required()
    }
    return  Joi.validate(data_, schema)
}