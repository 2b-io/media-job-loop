import ms from 'ms'

import api from 'services/api'
import {
  invalidationPatternService,
  invalidationProjectService,
  invalidationPresetService
} from 'services/invalidation'

const invalidationPatterns = async (projectIdentifier, invalidationIdentifier) => {
  const {
    Id: invalidationId
  } = await invalidationPatternService(projectIdentifier, invalidationIdentifier)

  if (!invalidationId) {
    return null
  }

   await api.call(
     'patch',
     `/projects/${ projectIdentifier }/invalidations/${ invalidationIdentifier }`,
     { cdnInvalidationRef: invalidationId }
   )

  return {
    name: 'CHECK_INVALIDATION',
    when: Date.now(),
    payload: {
      projectIdentifier,
      invalidationIdentifier
    }
  }
}

const invalidationProject = async (projectIdentifier) => {
  return await invalidationProjectService(projectIdentifier)
}

const invalidationPreset = async (projectIdentifier, presetHash) => {
  return await invalidationPresetService(projectIdentifier, presetHash)
}

export default async (job) => {
  const {
    payload: {
      projectIdentifier,
      invalidationIdentifier,
      presetHash
    }
  } = job

  if (projectIdentifier) {
    return null
  }

  if (presetHash) {
    return await invalidationPreset(projectIdentifier, presetHash)
  }

  if (invalidationIdentifier) {
    return await invalidationPatterns(projectIdentifier, invalidationIdentifier)
  }

  return await invalidationProject(projectIdentifier)
}
