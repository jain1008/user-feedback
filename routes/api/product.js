var router = require('express').Router();
var connection = require('../../dbconnection')
var express = require('express');
var product_model = require('../../models/product-model')
var comment_model = require('../../models/comment-model')
var Joi = require('../../validate-data')
var HttpStatus = require('http-status-codes')
var rms = require('../../response_msg')
var CONSTANTS = require('../../constants')

router.post('/comments-list', async (req, res) => {

    let response = {};
    let status = req.body.status;
    let product_type = req.body.product_type;
    let product_category = req.body.product_category;
    const { error } = validateProductComment(req.body);
    if (error) {
        res.status(HttpStatus.OK).send({ 'status': HttpStatus.BAD_REQUEST, data: [], msg: error.details[0].message });
        return
    } else {
        await getComments(1, status, product_type, product_category).then(function (req_response) {
            var tempArr = {};
            if (req_response.code != HttpStatus.OK) {
                rms.sendResponse(res, req_response.code, [])
                return
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

router.post('/save-feedback', async (req, res) => {
    let returnResponse = []
    let productArr = []
    let order_id = 0
    let is_insert = true
    productArr['product_id'] = []
    if (req.body.prodPost) {
        for (let key in req.body.prodPost) {
            var data = [];
            data['order_id'] = req.body.prodPost[key].order_id;
            productArr['product_id'][key] = data['product_id'] = req.body.prodPost[key].product_id;
            data['user_id'] = req.body.prodPost[key].user_id;
            data['comment_id'] = req.body.prodPost[key].comment_id;
            data['rating'] = req.body.prodPost[key].rating;
            data['status'] = req.body.prodPost[key].status;
            data['feedback_by'] = req.body.prodPost[key].feedback_by;
            const { error } = validateProductFeedback(data);
            if (error) {
                res.status(HttpStatus.BAD_REQUEST).send({ 'status': HttpStatus.BAD_REQUEST, data: [], msg: error.details[0].message });
                is_insert = false
                return false
            }
            await checkOrderProduct(data['order_id'], data['product_id']).then(req_response => {
                if (req_response === false) {
                    rms.sendResponse(res, HttpStatus.BAD_REQUEST, [], 'Order to product mismatch')
                    is_insert = false
                    return false
                }
            })
        }
        
        if (is_insert) {
            await saveProductFeedback(req.body.prodPost).then(req_response =>{
                if(req_response === true){
                    rms.sendResponse(res, HttpStatus.OK, [], 'Feedback Saved')
                    return
                }else{
                    rms.sendResponse(res, HttpStatus.NOT_FOUND, [], 'Something went wrong')                    
                }
            })
        }
    }
});

module.exports = router;
