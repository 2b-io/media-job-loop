import request from 'superagent'
import delay from 'delay'
import ms from 'ms'

const handleMessage = async (msg) => {
  const { name, when, payload } = JSON.parse(msg.content.toString())

  if (when > Date.now()) {
    console.log('RE_SEND_MESSAGE')
    await delay(ms('5s'))

    await request
      .post(`localhost:3006/api/v1/jobs`)
      .set('Content-Type', 'application/json')
      .send({ name, when, payload })
    return
  }
  console.log('CHECK_JOB_NAME')

  // call executor

  // add next job
  // .send({ name, payload, when: when + payload.period })
}

const worker = async (channel, queue) => {
  channel.consume(queue, async (msg) => {
    await handleMessage(msg)
  }, {noAck: true})
}

export default worker
