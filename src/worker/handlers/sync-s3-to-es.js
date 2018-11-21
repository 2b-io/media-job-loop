import ms from 'ms'
import request from 'superagent'

import config from 'infrastructure/config'
import da from 'services/da'

const PREFIX = config.aws.elasticSearch.prefix

export default async (job) => {
  const {
    name,
    when,
    payload: {
      projectIdentifier,
      continuationToken,
      lastSynchronized,
      maxKeys
    }
  } = job
  console.log('maxKeys', maxKeys)
  console.log('Run migration data please wait ...')

  const { isActive } = await da.getProjectByIdentifier(projectIdentifier)

  if (!isActive) {
    return null
  }

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
        maxKeys,
        lastSynchronized: lastSynchronized || Date.now(),
        retry: true
      }
    }
  } else {
    return {
      name: 'PRUNE_ES',
      when: Date.now(),
      payload: {
        maxKeys,
        projectIdentifier,
        lastSynchronized,
        retry: true
      }
    }
  }
}
