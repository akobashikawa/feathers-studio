const socket = io('http://localhost:3030');

socket.on('everybody', function (message) {
    console.log(message);
});

socket.on('api/todo created', task => {
    console.log('created', task);
    app._addTask(null, task);
});

socket.on('api/todo updated', task => {
    console.log('updated', task);
    app._updateTask(null, task);
});

socket.on('api/todo removed', task => {
    console.log('removed', task);
    app._removeTask(null, task);
});

var app = new Vue({
    el: '#app',
    data: {
        tasks: [],
        newTask: ''
    },
    filters: {
        json: function (value) {
            return JSON.stringify(value, null, 2);
        }
    },
    mounted: function () {
        this.getTasks();
    },
    methods: {
        getTasks: function () {
            const url = `/api/todo`;
            fetch(url)
                .then(res => res.json())
                .then(result => {
                    this.tasks = result.data;
                    this.$refs['newTask'].focus();
                })
                .catch(err => console.log(err));
        },
        getTask: function (id) {
            const url = `/api/todo/${id}`;
            fetch(url)
                .then(res => res.json())
                .then(task => {
                    let taskToUpdate = this.tasks.find(item => item.id === task.id);
                    taskToUpdate = Object.assign(taskToUpdate, task);
                })
                .catch(err => console.log(err));
        },
        toogleStatus: function (task) {
            switch (task.status) {
                case "todo":
                    task.status = 'doing';
                    break;
                case "doing":
                    task.status = 'done';
                    break;
                case "done":
                    task.status = 'todo';
                    break;
            }
            this.updateTask(task);
        },
        _addTask: function(error, task) {
            if (error) {
                throw error;
            }
            this.tasks.push(task);
            this.newTask = '';
            this.$refs['newTask'].focus();
        },
        addTask: function (text) {
            const description = text && text.trim();
            if (!description) {
                return;
            }
            const data = {
                description,
                status: 'todo'
            }
            socket.emit('create', '/api/todo', data, null);
        },
        _updateTask: function (error, task) {
            if (error) {
                throw error;
            }
            let taskToUpdate = this.tasks.find(item => item.id === task.id);
            taskToUpdate = Object.assign(taskToUpdate, task);
        },
        updateTask: function (task) {
            const id = task.id;

            const data = {
                id,
                description: task.description,
                status: task.status
            };
            socket.emit('update', '/api/todo', id, data, null);
        },
        _removeTask: function (error, task) {
            if (error) {
                throw error;
            }
            this.tasks = this.tasks.filter(item => item.id !== task.id);
        },
        removeTask: function (task) {
            if (!confirm('Remove task: ' + task.description.substr(0, 14))) {
                return;
            }
            const id = task.id;
            socket.emit('remove', '/api/todo', id, null);
        },
        cancelEditTask: function (task) {
            this.getTask(task.id);
        },
    }
});