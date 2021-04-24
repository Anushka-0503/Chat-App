const moment = require('moment');

function formatMessage(name,  message) {
    return {
        name,
        message,
        time: moment().format('h:mm a')
    }
}

module.exports = {
    formatMessage,
};