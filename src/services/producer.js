import amqp from 'amqplib'

import connect from 'services/connection'
import channel from 'services/channel'
import config from 'infrastructure/config'

const QUEUE = 'media-queue'

const send = async (msg = 'message') => {
  const conn = await connect()
  const ch = await channel.createChannel(conn)
  await ch.assertQueue(QUEUE, { durable: false })
  ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)), {persistent: true})
}

export default send
