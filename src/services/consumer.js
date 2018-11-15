import amqp from 'amqplib'
import connect from 'services/connection'
import channel from 'services/channel'
import Worker from 'workers'

const QUEUE = 'media-queue'

const createConsumer = async () => {
  console.log('CONSUMER_START')
  const conn = await connect()
  const ch = await channel.createChannel(conn)
  await ch.assertQueue(QUEUE, { durable: false })
  await Worker(ch, QUEUE)
}

createConsumer()
