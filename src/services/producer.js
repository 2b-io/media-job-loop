import rabbitmq from 'infrastructure/rabbit-mq'

const createProducer = async (param) => {
  const connection = await rabbitmq.connect(param.host)
  const channel = await connection.createChannel(param.queue)
  return {
    sendToQueue() {
      channel.sendToQueue(
        param.queue, Buffer.from(
          JSON.stringify(param.message)
        ), { persistent: true }
      )
    }
  }
}

export default createProducer
