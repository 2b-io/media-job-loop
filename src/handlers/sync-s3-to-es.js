import ms from 'ms'
import request from 'superagent'

import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  console.log('SYNC_S3_TO_ES...')

  const {
    name,
    when,
    payload: {
      projectIdentifier,
      continuationToken,
      lastSynchronized = Date.now(),
      maxKeys
    }
  } = job

  const project = await api.call('get', `/projects/${ projectIdentifier }`)

  if (!project.isActive || project.isDeleted) {
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

  console.log('SYNC_S3_TO_ES... DONE!')

  if (isTruncated) {
    return {
      name,
      when: Date.now(),
      payload: {
        continuationToken: nextContinuationToken,
        projectIdentifier,
        maxKeys,
        lastSynchronized
      }
    }
  } else {
    return {
      name: 'PRUNE_ES',
      when: Date.now(),
      payload: {
        maxKeys,
        projectIdentifier,
        lastSynchronized
      }
    }
  }
}
