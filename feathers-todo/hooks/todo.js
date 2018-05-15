// hooks

const setTimestamp = async context => {
    context.result.timestamp = new Date();
    return context;
};

const hooks = {
    after: {
        all: setTimestamp
    }
};

module.exports = hooks;