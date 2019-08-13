var connection = require('../dbconnection')
var HttpStatus = require('http-status-codes')

checkOrderExits = (order_id, callback) => {
    console.log('SELECT count(1) as count FROM uc_orders where order_id = ' + parseInt(order_id))
    connection.query('SELECT count(1) as count FROM uc_orders where order_id = ' + parseInt(order_id), function (err, rows, fields) {
        if (err) {
            callback(false)
        } else {
            if (rows[0].count > 0) {
                callback(true)
            } else {
                callback(false)
            }
        }
    });
}

getOrderProducts = (order_id) => {
    if (parseInt(order_id)) {
        return new Promise((resolve, reject) => {
            try {
                checkOrderExits(order_id, (req_response) => {
                    if (req_response) {
                        connection.query('SELECT nid as product_id,title,vpc_id as type,image,co FROM uc_order_products as a left join vendor_product_category as b on a.type = b.vpc_name where order_id = ' + parseInt(order_id), function (err, rows, fields) {
                            if (err) {
                                resolve({ "code": HttpStatus.INTERNAL_SERVER_ERROR, "data": [] })
                            } else {
                                if (rows.length > 0) {
                                    resolve({ "code": HttpStatus.OK, "data": rows })
                                } else {
                                    resolve({ "code": HttpStatus.NOT_FOUND, "data": [] })
                                }
                            }
                        });
                    } else {
                        resolve({ "code": HttpStatus.OK, "data": [], "msg": "Order not found" })
                    }
                })
            } catch (err) {
                resolve({ "code": HttpStatus.INTERNAL_SERVER_ERROR, "data": [] })
            }

        });
    } else {
        resolve({ "code": HttpStatus.NOT_FOUND, "data": [] })
    }
}

saveOrderFeedback = (data) => {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO order_feedback(order_id, user_id, comment_id, status, feedback_by) VALUES (' + data.order_id + ', ' + data.user_id + ', "' + data.comment_id + '", ' + data.status + ', ' + data.feedback_by + ')', function (err, result) {
            if (result.insertId) {
                resolve({ "code": HttpStatus.OK, "data": { "id": result.insertId } })
            } else {
                resolve({ "code": HttpStatus.NOT_FOUND, "data": [] })
            }
        });
    })
}

updateOrderFeedback = (data, order_id) => {
    return new Promise((resolve, reject) => {
        let str = '';
        for (key in data) {
            if (typeof data[key] == "number") {
                str += key + ' =' + data[key] + ','
            } else {
                str += key + ' = "' + data[key] + '",'
            }
        }
        let setStr = str.slice(0, -1)
        let query = 'UPDATE  order_feedback set ' + setStr + ' where order_id = ' + order_id
        console.log(query)
        connection.query(query, function (err, result) {
            console.log(result.affectedRows)
            if (result.affectedRows) {
                resolve({ "code": HttpStatus.OK, "data": [] })
            } else {
                resolve({ "code": HttpStatus.NOT_FOUND, "data": [] })
            }
        });
    })
}
