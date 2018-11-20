import ms from 'ms'

import cloudfront from 'services/cloud-front'
import da from 'services/da'

const checkInfrastructure = async (job) => {
  try {
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
      return [
        {
          name: 'SYNC_S3_TO_ES',
          when: Date.now(),
          payload: {
            projectIdentifier,
            startTime: Date.now()
          }
        },
        {
          name: 'GET_METRIC_DATA',
          when: Date.now(),
          payload: {
            projectIdentifier,
            metricName: 'BYTES_DOWNLOADED',
            startTime: Date.now()
          }
        },
        {
          name: 'GET_METRIC_DATA',
          when: Date.now(),
          payload: {
            projectIdentifier,
            metricName: 'REQUESTS',
            startTime: Date.now()
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
  } catch (error) {
    console.log(error)
  }
}

export default {
  checkInfrastructure
}
