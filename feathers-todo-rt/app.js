const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const { BadRequest } = require("@feathersjs/errors");
const morgan = require('morgan');
const logger = require('feathers-logger');
const { profiler, getProfile, getPending } = require('feathers-profiler');
const path = require('path');
const todoService = require('./services/todo');
const todoHooks = require('./hooks/todo');

const app = express(feathers());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.configure(express.rest());
app.configure(logger(morgan('dev')));
app.use(express.errorHandler());


// real time

app.configure(socketio());

// On any real-time connection, add it to the `everybody` channel
app.on('connection', connection => app.channel('everybody').join(connection));

// Publish all events to the `everybody` channel
app.publish(() => app.channel('everybody'));


// static

app.use(express.static('public'));


// services

app.use('/api/todo', todoService);


// views

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
// app.get('/', function (req, res, next) {
//     res.render('index');
// })


// profiler

app.configure(profiler({ stats: 'detail' }));
console.log('pending', getPending());
console.log(require('util').inspect(getProfile(), {
    depth: 5,
    colors: true
}));


// hooks

app.service('/api/todo').hooks(todoHooks);

// test
app.service('/api/todo').create({
    description: 'To do',
    status: 'todo'
});
app.service('/api/todo').create({
    description: 'Doing',
    status: 'doing'
});
app.service('/api/todo').create({
    description: 'Done',
    status: 'done'
});


// server

const server = app.listen(3030);

server.on('listening', () => console.log('Feathers REST API started at http://localhost:3030'));