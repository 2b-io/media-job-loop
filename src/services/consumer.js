import rabbimq from 'infrastructure/rabbit-mq'

const createConsumer = async (param) => {
  const connection = await rabbimq.connect(param.host)
  const channel = await connection.createChannel()
  const queue = await channel.assertQueue(param.queue)
  channel.prefetch(1)
  return {
    onMessage(callBack) {
      channel.consume(param.queue, async (msg) => {
        try {
          const job = JSON.parse(msg.content.toString())

          await callBack(job)

          await channel.ack(msg)
        } catch (e) {
          console.log(e)
        }
      }, { noAck: false })
    }
  }
}

export {
  createConsumer
}
