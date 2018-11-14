import amqp from 'amqplib'

const queue = 'media-queue'

const response = async () => {
  const connection = await amqp.connect('amqp://localhost')
  const channel = await connection.createChannel()
  await channel.assertQueue(queue, { durable: false })
}

export default response
