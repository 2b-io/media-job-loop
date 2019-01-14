import api from 'services/api'
import {
  invalidationByPattern,
  invalidationByProject,
  invalidationByPresetHash,
  invalidationByContentType
} from 'services/invalidation'

const invalidationPatterns = async (projectIdentifier, invalidationIdentifier) => {
  const {
    Id: invalidationId
  } = await invalidationByPattern(projectIdentifier, invalidationIdentifier)

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
    return await invalidationByPresetHash(projectIdentifier, presetHash)
  }

  if (contentType) {
    return await invalidationByContentType(projectIdentifier, contentType)
  }

  if (invalidationIdentifier) {
    return await invalidationPatterns(projectIdentifier, invalidationIdentifier)
  }

  return await invalidationByProject(projectIdentifier)
}
