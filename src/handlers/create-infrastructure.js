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

  // get project
  const project = await api.call('get', `/projects/${ projectIdentifier }`)

  if (!project || project.isDeleted) {
    return null
  }
  // get infrastructure
  const infrastructure = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  const {
    distribution,
    domain
  } = await cloudfront.createDistribution(projectIdentifier, {
    comment: `${ config.development ? 'DEV:' : '' }${ projectIdentifier }`
  })

  // update infrastructure
  await api.call('patch', `/projects/${ projectIdentifier }/infrastructure`, {
    ref: distribution.Id,
    domain: distribution.DomainName,
    cname: domain
  })

  return {
    name: 'CHECK_INFRASTRUCTURE',
    when: Date.now(),
    payload: {
      projectIdentifier
    }
  }
}
