import Connection from './connection'

class Producer extends Connection {
  constructor(props) {
    super(props)
  }

  async send(msg) {
    const { isReady, channel, queue } = this.state

    console.log(isReady, channel, queue)

    if (!isReady) {
      throw 'Not connect to RabbitMQ'
    }

    await channel.sendToQueue(this.state.queue, Buffer.from(JSON.stringify(msg)), {
      persistent: true
    })
  }
}

export const createProducer = (options) => {
  return new Producer(options)
}
