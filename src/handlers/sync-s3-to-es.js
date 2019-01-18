import ms from 'ms'
import request from 'superagent'

import api from 'services/api'
import syncS3ToEsService from 'services/sync-s3-to-es'

export default async (job) => {
  console.log('SYNC_S3_TO_ES...')

  const {
    name,
    when,
    payload: {
      projectIdentifier,
      continuationToken,
      maxKeys
    }
  } = job

  const project = await api.call('get', `/projects/${ projectIdentifier }`)

  if (!project.isActive || project.isDeleted) {
    return null
  }
  const lastSynchronized = new Date().toISOString()

  const {
    nextContinuationToken,
    isTruncated
  } = await syncS3ToEsService(projectIdentifier, continuationToken, lastSynchronized, maxKeys)

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
  }

  console.log('SYNC_S3_TO_ES... DONE!')

  return {
    name: 'PRUNE_ES',
    when: Date.now(),
    payload: {
      projectIdentifier,
      lastSynchronized,
      maxKeys
    }
  }
}
