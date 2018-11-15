import config from 'infrastructure/config'
import { createProducer } from 'services/producer'

import app from './app'

const {
  amq: { host, queue },
  server: { port, bind }
} = config

const main = async () => {
  const producer = await createProducer({
    host,
    queue
  })

  app.set('producer', producer)

  app.listen(port, bind, () => {
    console.log(`Server start at ${ bind }:${ port }`)
  })
}

main()
