import ms from 'ms'

import api from 'services/api'
import { invalidateByProject } from 'services/cache'

export default async (job) => {
  const { payload: { projectIdentifier } } = job

  await invalidateByProject(projectIdentifier)

  return null
}
