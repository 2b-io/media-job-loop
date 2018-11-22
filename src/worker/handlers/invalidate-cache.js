import ms from 'ms'
import request from 'superagent'

import cache from 'services/cache'
import da from 'services/da'

export default async (job) => {
  const {
    payload: {
      projectIdentifier,
      patterns,
      options = {
        deleteOnS3: true,
        deleteOnDistribution: true
      }
    }
  } = job

  const {
    _id: projectId,
  } = await da.getProjectByIdentifier(projectIdentifier)

  const {
    identifier: distributionIdentifier
  } = await da.getInfrastructureByProject(projectId)

  const {
    Id: invalidationIdentifier,
    Status: status
  } = await cache.invalidateByPatterns(projectIdentifier, patterns, options)

  if (invalidationIdentifier) {
    await request
      .put(`${ config.apiServer }/projects/:${ projectIdentifier }/invalidations/:${ invalidationIdentifier }`)
      .set('Content-Type', 'application/json')
      .send({
        status
      })
    return [
      {
        name: 'CHECK_INVALIDATION',
        when: Date.now(),
        payload: {
          projectIdentifier,
          distributionIdentifier,
          invalidationIdentifier
        }
      }
    ]
  } else {
    return null
  }
}
