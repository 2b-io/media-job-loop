// import request from 'superagent'
// import delay from 'delay'
// import ms from 'ms'

// import config from 'infrastructure/config'
// import { createConsumer } from 'services/consumer'
// import migrate from './jobs/migrate'
// import infrastructure from './jobs/infrastructure'
// import report from './jobs/report'

// const handleJob = async (job) => {
//   const { name, payload, when } = job

//   console.log(`HANDLE JOB: ${ name }, SCHEDULED WHEN: ${ new Date(when).toISOString() } `)

//   if (when > Date.now()) {
//     console.log(`NOT IN RIGHT TIME..., PUT BACK QUEUE`)

//     return [ { name, payload, when } ]
//   }

//   console.log(`EXECUTE JOB ${ name }`)

//   // TODO: execute job
//   switch (name) {
//     case 'SYNC_S3_TO_ES': {
//       console.log('SYNC_S3_TO_ES')
//       return await migrate.syncS3ToEs(job)
//     }
//     case 'CHECK_INFRASTRUCTURE': {
//       console.log('CHECK_INFRASTRUCTURE')
//       return await infrastructure.checkInfrastructure(job)
//     }
//     case 'GET_METRIC_DATA': {
//       console.log('GET_METRIC_DATA')
//       return await report.getMetricData(job)
//     }
//   }
// }

// const sendJobs = async (jobs) => {
//   await jobs.reduce(
//     async (previousJob, job) => {
//       await previousJob

//       try {
//       return await request
//           .post(`${ config.apiUrl }/jobs`)
//           .set('Content-Type', 'application/json')
//           .send(job)
//       } catch (error) {
//         console.error(error)
//       }
//     },
//     Promise.resolve()
//   )
// }

// const worker = async () => {
//   const consumer = await createConsumer({
//     host: config.amq.host,
//     queue: config.amq.queue
//   })

//   consumer.onMessage(async (job) => {
//     console.log(`RECEIVED JOB AT: ${ new Date().toISOString() }`)

//     try {
//       const nextJobs = await handleJob(job)

//       if (nextJobs.length) {
//         await sendJobs(nextJobs)
//       }
//     } catch (e) {
//       if (job.payload.retry) {
//         await sendJobs([ job ])
//       }
//     } finally {
//       await delay(ms('5s'))
//     }
//   })
// }

// worker()

const main = async () => {
  console.log('WORKER BOOTSTRAPPED...')
}

main()
