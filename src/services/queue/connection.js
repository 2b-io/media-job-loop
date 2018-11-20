import amqp from 'amqplib'
import delay from 'delay'
import ms from 'ms'

export default class Connection {
  constructor(props) {
    this.props = {
      retryInterval: ms('5s'),
      ...props
    }

    this.state = {
      retryCount: 0,
      channel: null,
      queue: `${ props.prefix }${ props.queue }`,
      isReady: false
    }
  }

  async connect() {
    console.log(`CONNECTING TO ${ this.props.host }, ATTEMPTS: ${ this.state.retryCount }`)

    try {
      const connection = await amqp.connect(this.props.host)
      const channel = await connection.createChannel()

      console.log('CONNECTED')

      // handle disconnect
      connection.once('close', () => {
        console.log('CONNECTION CLOSED')

        this.retry()
      })

      // set state
      this.setChannel(channel)

      // assert queue
      await channel.assertQueue(this.state.queue)
    } catch (e) {
      console.error('CONNECT FAILED', e)

      return this.retry()
    }
  }

  async retry() {
    console.log('RECONNECT AFTER 5s...')

    await delay(this.props.retryInterval)

    this.state.retryCount++

    return await this.connect()
  }

  setChannel(channel) {
    this.state.channel = channel
    this.state.isReady = true
  }

  reset() {
    this.state.channel = null
    this.state.isReady = false
  }
}
