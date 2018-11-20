import config from 'infrastructure/config'
import { createConsumer } from 'services/queue/consumer'

const main = async () => {
  const consumer = createConsumer({
    host: config.amq.host,
    queue: config.amq.queue,
    prefix: config.amq.prefix
  })

  console.log(consumer)

  await consumer
    .onReceive(async (job) => {
      console.log('RECEIVE JOB', job)
    })
    .connect()

  console.log('WORKER BOOTSTRAPPED...')
}

main()
