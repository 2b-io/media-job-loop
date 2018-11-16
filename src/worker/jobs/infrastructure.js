import ms from 'ms'

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
    } = await da.getInfrastructure(projectID)

    const {
      Distribution: distribution
    } = await da.getDistribution(infraIdentifier)

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
      return {
        name,
        when: Date.now() + ms('5m'),
        payload: {
          retry: false
        }
      }
    } else {
      console.log('RE_UPDATE')
      return {
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
