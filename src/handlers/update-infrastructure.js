import api from 'services/api'
import cloudfront from 'services/cloudfront'

export default async (job) => {
  const {
    name,
    when,
    payload: {
      projectIdentifier,
      isActive
    }
  } = job

  // get project
  const project = await api.call('get', `/projects/${ projectIdentifier }`)

  // get infrastructure
  const infrastructure = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  await cloudfront.updateDistribution(infrastructure.ref, {
    enabled: isActive
  })

  return {
    name: 'CHECK_INFRASTRUCTURE',
    when: Date.now(),
    payload: {
      projectIdentifier
    }
  }
}
