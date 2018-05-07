const feathers = require('@feathersjs/feathers');
const app = feathers();

app.use('helloService', {
    async get(name) {
        const message = `Hello ${name}!`
        return {
            name,
            message
        }
    }
});

async function hello(name) {
    const service = app.service('helloService');
    const result = await service.get(name);

    console.log(result);
}

hello('World');