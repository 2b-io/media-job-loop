import rabbitmq from 'infrastructure/rabbit-mq'

export const createProducer = async (param) => {
  const connection = await rabbitmq.connect(param.host)
  const channel = await connection.createChannel(param.queue)

  return {
    async sendMessage(msg) {
      return await channel.sendToQueue(
        param.queue,
        Buffer.from(JSON.stringify(msg)),
        { persistent: true }
      )
    }
  }
}
