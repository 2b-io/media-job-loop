import ms from 'ms'
import request from 'superagent'

import config from 'infrastructure/config'

const migrate = async (job) => {
  const {
    name,
    when,
    payload: {
      projectIdentifier,
      continuationToken,
      maxKeys
    }
  } = job
  console.log('maxKeys', maxKeys)
  console.log('Run migration data please wait ...')

  try {
    const {
      body: {
        nextContinuationToken,
        message,
        isTruncated
      }
    } = await request
      .post(`${ config.migrateSever }/migration`)
      .set('Content-Type', 'application/json')
      .send({
        projectIdentifier,
        continuationToken: continuationToken || null,
        maxKeys
      })
    console.log("MESSAGE =>>", message)
    console.log("IS_TRUNCATED =>>", isTruncated)

    if (isTruncated) {
      return {
        name,
        when,
        payload: {
          continuationToken: nextContinuationToken,
          projectIdentifier,
          maxKeys
        }
      }
    } else {
      return {
        name,
        when: Date.now() + ms('5m'),
        payload: {
          maxKeys,
          projectIdentifier
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export default migrate
