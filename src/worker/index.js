import request from 'superagent'
import delay from 'delay'
import ms from 'ms'

import config from 'infrastructure/config'
import { createConsumer } from 'services/consumer'
import migrate from './jobs/migrate'
import infrastructure from './jobs/infrastructure'

const handleJob = async (job) => {
  const { name, payload, when } = job

  console.log(`HANDLE JOB: ${ name }, SCHEDULED WHEN: ${ new Date(when).toISOString() } `)

  if (when > Date.now()) {
    console.log(`NOT IN RIGHT TIME..., PUT BACK QUEUE`)

    return { name, payload, when }
  }

  console.log(`EXECUTE JOB ${ name }`)

  // TODO: execute job
  switch (name) {
    case 'MIGRATE': {
      console.log('MIGRATE')
      return await migrate(job)
    }
    case 'UPDATE_STATUS_INFRASTRUCTURE': {
      console.log('UPDATE_STATUS_INFRASTRUCTURE')
      return await infrastructure.updateStatusProject(job)
    }
  }
}

const sendJob = async (job) => {
  await request
    .post(`${ config.apiUrl }/jobs`)
    .set('Content-Type', 'application/json')
    .send(job)
}

const worker = async () => {
  const consumer = await createConsumer({
    host: config.amq.host,
    queue: config.amq.queue
  })

  consumer.onMessage(async (job) => {
    console.log(`RECEIVED JOB AT: ${ new Date().toISOString() }`)

    try {
      const nextJob = await handleJob(job)

      if (nextJob) {
        await sendJob(nextJob)
      }
    } catch (e) {
      if (job.payload.retry) {
        await sendJob(job)
      }
    } finally {
      await delay(ms('5s'))
    }
  })
}

worker()
