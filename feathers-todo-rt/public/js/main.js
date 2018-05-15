const socket = io('http://localhost:3030');

socket.on('created', message =>
    console.log('Someone created a task', message)
);

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
        addTask: function (newTask) {
            const description = newTask && newTask.trim();
            if (!description) {
                return;
            }

            const url = `/api/todo`;
            const headers = {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            };
            const data = {
                description,
                status: 'todo'
            }
            socket.emit('create', '/api/todo', data, (error, result) => {
                if (error) {
                    throw error;
                }
                // socket.emit('find', '/api/todo', (error, messageList) => {
                //     if (error) throw error
                //     console.log('Current tasks', messageList);
                // });
                const task = Object.assign(data, result);
                socket.emit('created', task);
                this.tasks.push(task);
                console.log(this.tasks);
                this.newTask = '';
                this.$refs['newTask'].focus();
            });
            // fetch(url, {
            //     method: 'POST',
            //     headers: new Headers(headers),
            //     body: JSON.stringify(data)
            // })
            //     .then(res => res.json())
            //     .then(result => {
            //         console.log('created');
            //         this.tasks.push(Object.assign(data, result));
            //         console.log(this.tasks);
            //         this.newTask = '';
            //         this.$refs['newTask'].focus();
            //     })
            //     .catch(err => console.log(err));
        },
        deleteTask: function (task) {
            if (!confirm('Delete task: ' + task.description.substr(0, 14))) {
                return;
            }
            const id = task.id;
            const url = `/api/todo/${id}`;
            fetch(url, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then(result => {
                    console.log('deleted');
                    this.tasks = this.tasks.filter(item => item.id !== id);
                })
                .catch(err => console.log(err));
        },
        updateTask: function (task) {
            const id = task.id;

            const url = `/api/todo/${id}`;
            const headers = {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            };
            const data = {
                description: task.description,
                status: task.status
            };
            fetch(url, {
                method: 'PUT',
                headers: new Headers(headers),
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(result => {
                    console.log('updated');
                })
                .catch(err => console.log(err));
        },
        cancelEditTask: function (task) {
            const id = task.id;
            const url = `/api/todo/${id}`;
            fetch(url)
                .then(res => res.json())
                .then(result => {
                    console.log('cancel edit');
                    let theTask = this.tasks.find(item => item.id == id);
                    theTask = Object.assign(theTask, result);
                })
                .catch(err => console.log(err));
        },
    }
});