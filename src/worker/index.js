import request from 'superagent'

import config from 'infrastructure/config'
import { createConsumer } from 'services/work-queue/consumer'

import * as handlers from './handlers'

const HANDLERS = {
  'SYNC_S3_TO_ES': handlers.syncS3ToEs,
  'CHECK_INFRASTRUCTURE': handlers.checkInfrastructure,
  'GET_METRIC_DATA': handlers.getMetricData
}

const handleJob = async (job) => {
  const handler = HANDLERS[ job.name ]

  if (!handler || typeof handler !== 'function') {
    return
  }

  return await handler(job)
}

const sendJobs = async (jobs) => {
  await Promise.all(
    jobs.map(
      (job) => request
        .post(`${ config.apiUrl }/jobs`)
        .set('content-type', 'application/json')
        .send(job)
    )
  )
}

const main = async () => {
  const consumer = createConsumer({
    host: config.amq.host,
    queue: config.amq.queue,
    prefix: config.amq.prefix
  })

  await consumer
    .onReceive(async (job) => {
      console.log(`RECEIVED JOB [${ job.name }] AT: ${ new Date().toISOString() }, SCHEDULED WHEN: ${ new Date(job.when).toISOString() } `)

      const nextJobs = job.when > Date.now() ?
        [ job ] : (await handleJob(job))

      if (nextJobs && nextJobs.length) {
        await sendJobs(nextJobs)
      }
    })
    .connect()

  console.log('WORKER BOOTSTRAPPED!')
}

main()
