var router = require('express').Router();
var order_model = require('../../models/order-model')
var comment_model = require('../../models/comment-model')
var Joi = require('../../validate-data')
var HttpStatus = require('http-status-codes')
var rms = require('../../response_msg')
var CONSTANTS = require('../../constants')

router.get('/comments-list/:status', async (req, res, next) => {
    let response = {};
    if (isNaN(parseInt(req.params.status))) {
        rms.sendResponse(res, HttpStatus.BAD_REQUEST, [], 'Invalid comment type')
    } else {
        await getComments(1, parseInt(req.params.status)).then(function (req_response) {
            var tempArr = {};
            if (req_response.code != HttpStatus.OK) {
                rms.sendResponse(res, req_response.code, [])
                return;
            } else {
                for (let items of req_response.data) {
                    tempArr[items.id] = { "id": items.id, "name": items.name, "parent_id": items.parent_id, "is_active": false };
                }
                var ids = {};
                for (let data in tempArr) {
                    response[tempArr[data].id] = { "id": tempArr[data].id, "name": tempArr[data].name, "is_active": false };
                    if (tempArr.hasOwnProperty(tempArr[data].parent_id)) {
                        delete response[tempArr[data].id];
                        ids[tempArr[data].id] = { "id": tempArr[data].id, "name": tempArr[data].name, "is_active": false };
                        response[tempArr[data].parent_id] = { "child_comment": ids, "id": response[tempArr[data].parent_id].id, "name": response[tempArr[data].parent_id].name, "is_active": false }
                        response[tempArr[data].parent_id].child_comment = Object.values(response[tempArr[data].parent_id].child_comment)
                    } else {
                        response[tempArr[data].id] = { "child_comment": [], "id": response[tempArr[data].id].id, "name": response[tempArr[data].id].name, "is_active": false }
                    }
                }
                rms.sendResponse(res, req_response.code, Object.values(response))
            }

        })
    }
});

router.get('/product-list/:order_id', async (req, res, next) => {
    if (isNaN(parseInt(req.params.order_id))) {
        rms.sendResponse(res, HttpStatus.BAD_REQUEST, [], 'Invalid Order ID')
        return;
    } else {
        getOrderProducts(req.params.order_id).then(function (req_response) {
            if (req_response.code != HttpStatus.OK) {
                rms.sendResponse(res, req_response.code, [])
                return;
            } else {
                if (req_response.data.length > 0) {
                    req_response.data.forEach(element => {
                        if (element.image) {
                            element.image = CONSTANTS.IMAGE_URL + element.image
                        }
                    });
                    rms.sendResponse(res, req_response.code, Object.values(req_response.data), req_response.msg)
                }
            }
        })
    }

});

router.post('/save-feedback', (req, res, next) => {
    let data = [];
    data['order_id'] = req.body.order_id;
    data['user_id'] = req.body.user_id;
    data['comment_id'] = req.body.comment_id;
    data['rating'] = req.body.rating;
    data['status'] = req.body.status;
    data['feedback_by'] = req.body.feedback_by;
    const { error } = validateOrderFeedback(req.body);
    if (error) {
        res.status(HttpStatus.OK).send({ 'status': HttpStatus.BAD_REQUEST, data: [], msg: error.details[0].message });
        return;
    }
    checkOrderExits(req.body.order_id, async (req_response) => {
        if (req_response == true) {
            checkOrderCommentExits(req.body.order_id, async (req_response) => {
                if(req_response === true){
                    await saveOrderFeedback(req.body).then(req_result => {
                        if (req_result.code == HttpStatus.OK) {
                            rms.sendResponse(res, req_result.code, req_result.data)
                            return                        
                        }else{
                            rms.sendResponse(res, req_result.code, req_result.data,'Order Commnet Exists')
                            return        
                        }
                    })
                }else{
                    rms.sendResponse(res, HttpStatus.OK, [],'Order Commnet Exists')
                }
            })            
        }else{
            rms.sendResponse(res, req_result.code, req_result.data,'Order not found')
        }
    });
});

router.post('/update-feedback', (req, res) => {
    if (isNaN(parseInt(req.body.order_id))) {
        res.status(HttpStatus.OK).send({ 'status': HttpStatus.BAD_REQUEST, data: [], msg: error.details[0].message });
        return;
    } else {
        checkOrderExits(req.body.order_id, async (req_response) => {
            if (req_response == true) {
                let data = req.body
                let order_id = data.order_id 
                delete data.order_id
                await updateOrderFeedback(data, order_id).then(req_result => {
                    if (req_result.code == HttpStatus.OK) {
                        rms.sendResponse(res, req_result.code, req_result.data,'Feedback Updated')
                        return
                    }else{
                        rms.sendResponse(res, HttpStatus.OK, [],'Feedback Updated')
                    }
                })
            }else{
                rms.sendResponse(res, HttpStatus.NOT_FOUND, [],'Order not found')
            }
        });
    }
});

module.exports = router;
