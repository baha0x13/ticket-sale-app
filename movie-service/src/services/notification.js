const config = require('../config');
const amqp = require('amqplib');

async function createChannel(q) {
    const connection = await amqp.connect(config.amqp_url);
    const channel = await connection.createChannel();
    await channel.assertQueue(q);
    return channel;
}

let channel = null;

module.exports = {
    async send(mail){
        channel = channel || await createChannel(config.services.notifications_q);
        return channel.sendToQueue(config.services.notifications_q, Buffer.from(JSON.stringify(mail)));
    }
};
