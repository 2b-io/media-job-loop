import ms from 'ms'

import api from 'services/api'
import {
  invalidationPatternService,
  invalidationProjectService,
  invalidationPresetService
} from 'services/invalidation'

const invalidationPatterns = async (projectIdentifier, invalidationIdentifier) => {
  const invalidationId = await invalidationPatternService(projectIdentifier, invalidationIdentifier)

  if (!invalidationId) {
    return null
  }

   await api.call(
     'patch',
     `/projects/${ projectIdentifier }/invalidations/${ invalidationIdentifier }`,
     { cdnInvalidationRef: invalidationId.Id }
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

const invalidationPresetHash = async (projectIdentifier, presetHash) => {
  return await invalidationPresetService.invalidatePresetHash(projectIdentifier, presetHash)
}

const invalidationContentType = async (projectIdentifier, contentType) => {
  return await invalidationPresetService.invalidateContentType(projectIdentifier, contentType)
}

export default async (job) => {
  const {
    payload: {
      projectIdentifier,
      invalidationIdentifier,
      presetHash,
      contentType
    }
  } = job

  if (!projectIdentifier) {
    return null
  }

  if (presetHash) {
    return await invalidationPresetHash(projectIdentifier, presetHash)
  }

  if (contentType) {
    return await invalidationContentType(projectIdentifier, contentType)
  }

  if (invalidationIdentifier) {
    return await invalidationPatterns(projectIdentifier, invalidationIdentifier)
  }

  return await invalidationProject(projectIdentifier)
}
