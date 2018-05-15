class ToDo {
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

const service = new ToDo();

module.exports = service;