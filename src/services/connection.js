import amqp from 'amqplib'

const connect = async (url = 'amqp://localhost') => {
  return await amqp.connect(url)
}
export default connect
