import config from 'infrastructure/config'
import { createProducer } from 'services/queue/producer'

import app from './app'

const {
  amq: { host, queue, prefix },
  server: { port, bind }
} = config

const main = async () => {
  const producer = createProducer({
    host,
    queue,
    prefix
  })

  await producer.connect()

  app.set('producer', producer)

  app.listen(port, bind, () => {
    console.log(`Server start at ${ bind }:${ port }`)
  })
}

main()
