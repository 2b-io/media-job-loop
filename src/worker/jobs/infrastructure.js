import ms from 'ms'

import cloudfront from 'services/cloudfront'
import da from 'services/da'

const updateStatusProject = async (job) => {
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

      await da.updateStatusProject(projectID, projectStatus, infraConfig.Enabled)

      console.log('UPDATE_SUCCESS')
      return null
    } else {
      console.log('RETRY_UPDATE')
      return {
        name,
        when: Date.now() + ms('5m'),
        payload: {
          projectIdentifier
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export default {
  updateStatusProject
}
