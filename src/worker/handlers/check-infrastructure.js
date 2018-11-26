import ms from 'ms'

import cloudfront from 'services/cloudfront'
import da from 'services/da'

export default async (job) => {
  const {
    name,
    when,
    payload: {
      projectIdentifier
    }
  } = job

  const {
    _id: projectID,
    status: currentStatusProject
  } = await da.getProjectByIdentifier(projectIdentifier)

  const {
    identifier: infraIdentifier
  } = await da.getInfrastructureByProject(projectID)

  const {
    Distribution: distribution
  } = await cloudfront.getDistribution(infraIdentifier)

  const {
    Status: infraStatus,
    DistributionConfig: infraConfig
  } = distribution

  if (infraStatus === 'Deployed' || infraStatus === 'Disabled') {
    const projectStatus = (infraStatus === 'InProgress') ? (
      currentStatusProject === 'INITIALIZING' ?
        'INITIALIZING' : 'UPDATING'
    ) :  infraStatus.toUpperCase()

    const { isActive } = await da.updateStatusProject(projectID, projectStatus, infraConfig.Enabled)

    if (!isActive) {
      return null
    }
    console.log('RUN_SYNC_S3_TO_ES_&&_GET_METRIC_DATA')
    const startTime = Date.now()

    return [
      {
        name: 'SYNC_S3_TO_ES',
        when: Date.now(),
        payload: {
          projectIdentifier,
          maxKeys: 10
        }
      },
      {
        name: 'GET_METRIC_DATA',
        when: Date.now(),
        payload: {
          projectIdentifier,
          metricName: 'BYTES_DOWNLOADED',
          startTime
        }
      },
      {
        name: 'GET_METRIC_DATA',
        when: Date.now(),
        payload: {
          projectIdentifier,
          metricName: 'REQUESTS',
          startTime
        }
      }
    ]
  } else {
    console.log('RETRY_UPDATE')
    return [
      {
        name,
        when: Date.now() + ms('5m'),
        payload: {
          projectIdentifier
        }
      }
    ]
  }
}
