import ms from 'ms'

import config from 'infrastructure/config'
import api from 'services/api'
import cloudfront from 'services/cloudfront'

export default async (job) => {
  const {
    name,
    when,
    payload: {
      projectIdentifier
    }
  } = job

  const project = await api.call('get', `/projects/${ projectIdentifier }`)

  if (!project) {
    return null
  }

  const infrastructure = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  const {
    Distribution: {
      Status: infraStatus,
      DistributionConfig: infraConfig
    }
  } = await cloudfront.getDistribution(infrastructure.ref)

  if (infraStatus === 'InProgress') {
    return {
      name,
      when: Date.now() + ms('5m'),
      payload: {
        projectIdentifier
      }
    }
  }

  // update status
  await api.call('patch', `/projects/${ projectIdentifier }`, {
    status: project.isActive ? 'DEPLOYED' : 'DISABLED'
  })

  if (!project.isActive) {
    return null
  }

  const startTime = new Date().toISOString()

  return [ {
    name: 'SYNC_S3_TO_ES',
    when: startTime,
    payload: {
      projectIdentifier,
      maxKeys: config.syncS3ToEsMaxFile
    }
  }, {
    name: 'GET_METRIC_DATA',
    when: startTime,
    payload: {
      metricName: 'BYTES_DOWNLOADED',
      projectIdentifier,
      startTime
    }
  }, {
    name: 'GET_METRIC_DATA',
    when: startTime,
    payload: {
      metricName: 'REQUESTS',
      projectIdentifier,
      startTime
    }
  } ]
}
