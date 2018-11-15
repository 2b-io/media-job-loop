const createChannel = async(conn) => {
  return await conn.createChannel()
}

const channelAssertQueue = async(channel, queueName) => {
  return await channel.assertQueue(queueName)
}

export default {
  createChannel,
  channelAssertQueue
}
