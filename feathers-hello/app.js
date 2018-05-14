const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const { BadRequest } = require("@feathersjs/errors");
const morgan = require('morgan');
const logger = require('feathers-logger');
const { profiler, getProfile, getPending } = require('feathers-profiler');
const path = require('path');

const app = express(feathers());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.configure(express.rest());
app.configure(logger(morgan('dev')));
app.use(express.errorHandler());

// service

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

app.use('/api/hello', new Hello());


// views

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', function (req, res, next) {
    res.render('index');
})


// profiler

app.configure(profiler({ stats: 'detail' }));
console.log('pending', getPending());
console.log(require('util').inspect(getProfile(), {
    depth: 5,
    colors: true
}));


// hooks

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

app.service('/api/hello').hooks(helloHooks);


// server

const server = app.listen(3030);

server.on('listening', () => console.log('Feathers REST API started at http://localhost:3030'));