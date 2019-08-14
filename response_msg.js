const SERVER_ERROR = 'Internal Server Error'
const NOT_FOUND = 'No Data Found'
const SUCCESS = 'Success'
const WRONG = 'Somedata is invalid or missing'
const HttpStatus = require('http-status-codes')
exports.sendResponse = (res, responseCode, data, msg = '') => {
    switch (responseCode) {
        case HttpStatus.INTERNAL_SERVER_ERROR:
            res.status(responseCode).send({ status: responseCode, data: data ? data : [], 'msg': SERVER_ERROR })
            break;
        case HttpStatus.NOT_FOUND:
            res.status(responseCode).send({ status: responseCode, data: data ? data : [], 'msg': msg ? msg :NOT_FOUND })
            break;
        case HttpStatus.BAD_REQUEST:
            res.status(responseCode).send({ status: responseCode, data: data ? data : [], 'msg': msg ? msg : WRONG })
            break;
        case HttpStatus.OK:
            res.status(responseCode).send({ status: responseCode, data: data ? data : [], 'msg': msg ? msg : SUCCESS })
            break;
    }
}