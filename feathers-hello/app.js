const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const { BadRequest } = require("@feathersjs/errors");
const memory = require('feathers-memory');

const app = express(feathers());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.configure(express.rest());
app.use(express.errorHandler());

class Hello {
    constructor() {
        this.data = {};
    }

    async find(params) {
        this.data.name = params.query.name;
        const name = this.data.name || 'World';

        this.data.message = `Hello ${name}`;
        return this.data;
    }
}

app.use('hello', new Hello());

const toUpperCase = async context => {
    context.params.query.name = context.params.query.name.toUpperCase();
    return context;
};

const addExclamation = async context => {
    context.result.message += '!';
    return context;
};

const setTimestamp = async context => {
    context.result.timestamp = new Date();
    return context;
};

const helloHooks = {
    before: {
        find: toUpperCase
    },
    after: {
        find: addExclamation,
        all: setTimestamp
    }
};

app.service('hello').hooks(helloHooks);

const server = app.listen(3030);

server.on('listening', () => console.log('Feathers REST API started at http://localhost:3030'));