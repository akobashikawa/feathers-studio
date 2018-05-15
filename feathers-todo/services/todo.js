const memory = require('feathers-memory');

const service = memory({
    paginate: {
        default: 10,
        max: 25
    }
});

module.exports = service;