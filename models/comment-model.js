var connection = require('../dbconnection')
var HttpStatus = require('http-status-codes')

getComments = (comment_type, status, prod_type, prod_category) => {
    let response = [];
    return new Promise((resolve, reject) => {
        try {
            let where = ''
            where += ' comment_type = ' + comment_type
            where += ' AND status = ' + status
            if (prod_type) {
                where += ' AND product_type = ' + prod_type
            }
            if (prod_category) {
                where += ' AND product_category_id = ' + prod_category
            }
            connection.query('SELECT * FROM feedback_comment where ' + where, function (err, rows, fields) {
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
        } catch (err) {
            resolve({ "code": HttpStatus.INTERNAL_SERVER_ERROR, "data": [] })
        }
    });
}
