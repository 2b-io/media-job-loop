import migrate from './jobs/migrate'
import rpc from 'services'

const main = async () => {
  const consumer = await rpc.createConsumer()
  await rpc.createProducer()
}

main()
