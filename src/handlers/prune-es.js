import ms from 'ms'

import api from 'services/api'

export default async (job) => {
  console.log('PRUNE ES...')

  const {
    name,
    when,
    payload: {
      projectIdentifier,
      lastSynchronized,
      maxKeys
    }
  } = job

  const { isTruncated } = await api.call(
    'delete',
    `/projects/${ projectIdentifier }/files`,
    { lastSynchronized: new Date(lastSynchronized).toISOString(), maxKeys }
  )

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

  console.log('PRUNE ES DONE')

  return {
    name: 'SYNC_S3_TO_ES',
    when: Date.now() + ms('3d'),
    payload: {
      projectIdentifier,
      maxKeys
    }
  }
}
