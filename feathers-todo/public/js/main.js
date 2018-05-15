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
        },
        addTask: function (newTask) {
            const task = newTask && newTask.trim();
            if (!task) {
                return;
            }

            const url = `/api/todo`;
            const headers = {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            };
            const data = {
                description: task,
                status: 'todo'
            }
            fetch(url, {
                method: 'POST',
                headers: new Headers(headers),
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(result => {
                    this.tasks.push(Object.assign(data, result));
                    console.log(this.tasks);
                    this.newTask = '';
                    this.$refs['newTask'].focus();
                })
                .catch(err => console.log(err));
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
                    this.tasks = this.tasks.filter(item => item.id !== id);
                })
                .catch(err => console.log(err));
        }
    }
});