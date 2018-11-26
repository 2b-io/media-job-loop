import ms from 'ms'
import request from 'superagent'

import config from 'infrastructure/config'
import { invalidateByPatterns } from 'services/cache'
import da from 'services/da'

export default async (job) => {
  const {
    payload: {
      projectIdentifier,
      invalidationIdentifier: invalidationId,
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
  } = await invalidateByPatterns(projectIdentifier, invalidationId, options)

  if (invalidationIdentifier) {
    await request
      .patch(`${ config.apiServer }/projects/${ projectIdentifier }/invalidations/${ invalidationId }`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'MEDIA_CDN app=jobs-loop')
      .send({
        status: status.toUpperCase(),
        cdnInvalidationRef: invalidationIdentifier
      })

    return {
      name: 'CHECK_INVALIDATION',
      when: Date.now(),
      payload: {
        projectIdentifier,
        distributionIdentifier,
        invalidationId
      }
    }
  } else {
    return null
  }
}
