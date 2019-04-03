import ms from 'ms'

import api from 'services/api'
import config from 'infrastructure/config'

export default async (job) => {
  console.log('PRUNE_ES...')

  const {
    name,
    when,
    payload: {
      projectIdentifier,
      lastSynchronized,
      maxKeys
    }
  } = job

  const files = await api.call(
    'get',
    `/projects/${ projectIdentifier }/files?lastSynchronized=${ encodeURIComponent(lastSynchronized) }&from=0&size=${ config.syncS3ToEsMaxFile }`
  )

  if (!files.length) {
    return {
      name: 'SYNC_S3_TO_ES',
      when: Date.now() + ms('3d'),
      payload: {
        projectIdentifier,
        maxKeys
      }
    }
  }

  const { deleted } = await api.call(
    'delete',
    `/projects/${ projectIdentifier }/files`,
    { lastSynchronized, maxKeys }
  )

  const isTruncated = files.length !== deleted

  if (isTruncated) {
    return {
      name,
      when: Date.now(),
      payload: {
        projectIdentifier,
        maxKeys,
        lastSynchronized
      }
    }
  }

  console.log('PRUNE_ES_SUCCESS')

  return {
    name: 'SYNC_S3_TO_ES',
    when: Date.now() + ms('3d'),
    payload: {
      projectIdentifier,
      maxKeys
    }
  }
}
