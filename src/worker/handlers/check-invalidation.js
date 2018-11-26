import ms from 'ms'
import request from 'superagent'

import config from 'infrastructure/config'
import cloudfront from 'services/cloudfront'
import da from 'services/da'

export default async (job) => {
  const {
    name,
    when,
    payload: {
      projectIdentifier,
      invalidationId,
      distributionIdentifier
    }
  } = job

  const { body: { cdnInvalidationRef: invalidationIdentifier } } = await request
      .get(`${ config.apiServer }/projects/${ projectIdentifier }/invalidations/${ invalidationId }`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'MEDIA_CDN app=jobs-loop')

  const {
    Status: invalidationStatus
  } = await cloudfront.getInvalidation(distributionIdentifier, invalidationIdentifier)

  if (invalidationStatus === 'InProgress') {
    return {
      name: 'CHECK_INVALIDATION',
      when: when + ms('1m'),
      payload: {
        projectIdentifier,
        invalidationId,
        distributionIdentifier
      }
    }
  } else {
    await request
      .patch(`${ config.apiServer }/projects/${ projectIdentifier }/invalidations/${ invalidationId }`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'MEDIA_CDN app=jobs-loop')
      .send({
        status: invalidationStatus.toUpperCase(),
      })

      return null
  }
}
