var connection = require('../dbconnection')
var HttpStatus = require('http-status-codes')

checkOrderProduct = (order_id, product_id, callback) => {
    return new Promise((resolve, reject) => {
        try {
            connection.query('SELECT count(1) as count FROM uc_orders where order_id = ' + parseInt(order_id), function (err, rows, fields) {
                if (err) {
                    resolve(false)
                } else {
                    if (rows[0].count > 0) {
                        connection.query('SELECT count(1) as count FROM uc_order_products where order_id = ' + parseInt(order_id) + ' AND nid = ' + parseInt(product_id), function (err_, rows_, fields) {
                            if (err_) {
                                resolve(false)
                            } else {
                                if (rows_[0].count > 0) {
                                    resolve(true)
                                } else {
                                    resolve(false)
                                }
                            }
                        })
                    } else {
                        resolve(false)
                    }
                }
            })
        } catch (err) {

        }
    })
}

saveProductFeedback = (data) => {
    return new Promise((resolve, reject) => {
        let value = '';
        for (key in data) {
            value += '('+data[key].order_id+','+data[key].product_id+','+data[key].user_id+','+data[key].rating+',"'+data[key].comment_id+'",'+data[key].status+','+data[key].feedback_by+'),'
        }
        let insertValue = value.slice(0, -1)
        connection.query('INSERT INTO order_product_feedback(order_id, product_id, user_id, rating, comment_id, status, feedback_by) VALUES '+insertValue, function (err, result) {
            console.log(result)
            if (result.affectedRows) {
                resolve(true)
            } else {
                resolve(false)
            }
        });
    })
}