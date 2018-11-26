import api from 'services/api'

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

  // get infrastructure
  const infrastructure = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  console.log(job, project, infrastructure)

  return null
}
