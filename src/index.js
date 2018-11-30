import asArray from 'as-array'

import config from 'infrastructure/config'
import { createConsumer } from 'services/work-queue/consumer'
import { createProducer } from 'services/work-queue/producer'

import * as handlers from './handlers'

const HANDLERS = {
  'CHECK_INFRASTRUCTURE': handlers.checkInfrastructure,
  'CREATE_INFRASTRUCTURE': handlers.createInfrastructure,
  'UPDATE_INFRASTRUCTURE': handlers.updateInfrastructure,

  'CHECK_INVALIDATION': handlers.checkInvalidation,
  'CREATE_INVALIDATION': handlers.createInvalidation,

  'SEND_EMAIL': handlers.sendEmail

  // 'GET_METRIC_DATA': handlers.getMetricData,
  // 'SYNC_S3_TO_ES': handlers.syncS3ToEs

}

const handleJob = async (job) => {
  const handler = HANDLERS[ job.name ]

  if (!handler || typeof handler !== 'function') {
    // return job untouched
    return job
  }

  return await handler(job)
}

const main = async () => {
  const consumer = createConsumer({
    host: config.amq.host,
    queue: config.amq.queue,
    prefix: config.amq.prefix,
    shortBreak: config.pulling.shortBreak,
    longBreak: config.pulling.longBreak
  })

  const producer = createProducer({
    host: config.amq.host,
    queue: config.amq.queue,
    prefix: config.amq.prefix,
  })

  const sendJobs = async (jobs) => {
    await Promise.all(
      jobs.map(
        (job) => producer.send(job)
      )
    )
  }

  consumer.onReceive(async (job) => {
    console.log(`RECEIVED JOB [${ job.name }] AT: ${ new Date().toISOString() }, SCHEDULED WHEN: ${ new Date(job.when).toISOString() } `)

    const nextJobs = asArray(
      job.when > Date.now() ?
        job : (await handleJob(job))
    )

    if (nextJobs && nextJobs.length) {
      await sendJobs(nextJobs)
    }
  })

  await Promise.all([
    producer.connect(),
    consumer.connect()
  ])

  console.log('WORKER BOOTSTRAPPED!')
}

main()
