import amqp from 'amqplib'

import config from 'infrastructure/config'
const queue = 'media-queue'

const send = async (msg = 'message') => {
  const connection = await amqp.connect('amqp://localhost')
  const channel = await connection.createChannel()
  channel.assertQueue(queue, { durable: false })
  channel.sendToQueue(queue, new Buffer(msg), {persistent: true})
}

export default send
