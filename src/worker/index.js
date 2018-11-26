import asArray from 'as-array'
import request from 'superagent'

import config from 'infrastructure/config'
import api from 'services/api'
import { createConsumer } from 'services/work-queue/consumer'

import * as handlers from './handlers'

const HANDLERS = {
  'CHECK_INFRASTRUCTURE': handlers.checkInfrastructure,
  'CREATE_INFRASTRUCTURE': handlers.createInfrastructure,
  'GET_METRIC_DATA': handlers.getMetricData,
  'SYNC_S3_TO_ES': handlers.syncS3ToEs
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
      (job) => api.call('post', '/jobs', job)
    )
  )
}

const main = async () => {
  const consumer = createConsumer({
    host: config.amq.host,
    queue: config.amq.queue,
    prefix: config.amq.prefix,
    shortBreak: config.pulling.shortBreak,
    longBreak: config.pulling.longBreak
  })

  await consumer
    .onReceive(async (job) => {
      console.log(`RECEIVED JOB [${ job.name }] AT: ${ new Date().toISOString() }, SCHEDULED WHEN: ${ new Date(job.when).toISOString() } `)

      const nextJobs = asArray(
        job.when > Date.now() ?
          job : (await handleJob(job))
      )

      if (nextJobs && nextJobs.length) {
        await sendJobs(nextJobs)
      }
    })
    .connect()

  console.log('WORKER BOOTSTRAPPED!')
}

main()
