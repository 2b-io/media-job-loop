import ms from 'ms'
import request from 'superagent'

import cloudfront from 'services/cloudfront'
import da from 'services/da'

export default async (job) => {
  const {
    name,
    when,
    payload: {
      projectIdentifier,
      distributionIdentifier,
      invalidationIdentifier
    }
  } = job

  const {
    Status: invalidationStatus
  } = await cloudfront.getInvalidation(distributionIdentifier, invalidationIdentifier)

  if (invalidationStatus === 'InProgress') {
    return {
      name: 'CHECK_INVALIDATION',
      when: when + ms('1m'),
      payload: {
        projectIdentifier,
        distributionIdentifier,
        invalidationIdentifier
      }
    }
  } else {
    await request
      .put(`${ config.apiServer }/projects/:${ projectIdentifier }/invalidations/:${ invalidationIdentifier }`)
      .set('Content-Type', 'application/json')
      .send({
        status
      })
      return null
  }
}
