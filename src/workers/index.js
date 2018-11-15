import request from 'superagent'
import delay from 'delay'
import ms from 'ms'

import config from 'infrastructure/config'
import { createConsumer } from 'services/consumer'

const handleJob = (job) => {
  const { name, payload, when } = job

  if (when > Date.now()) {

    return { name, payload, when }
  }

  switch (name) {
    case 'MIGRATE':
    console.log('MIGRATE');
    // TODO: execute jobs
    return {
      name,
      payload,
      when: when + payload.period,
    }
  }
}

const sendJob = async (job) => {
  await request
    .post(config.apiUrl)
    .set('Content-Type', 'application/json')
    .send(job)
}

const worker = async () => {
  const consumer = await createConsumer({
    host: config.amq.host,
    queue: config.amq.queue
  })

  consumer.onMessage(async (job) => {
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
