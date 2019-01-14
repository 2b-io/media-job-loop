import api from 'services/api'

export const searchByPatterns = async (projectIdentifier, patterns) => {
  const allObjects = await patterns.reduce(
    async (previousJob, pattern) => {
      const prevObjects = await previousJob || []
      const nextObjects = await api.call('get', `/projects/${ projectIdentifier }/files?pattern=${ encodeURIComponent(pattern) }`)

      return [ ...prevObjects, ...nextObjects ]
    }, Promise.resolve()
  )

  if (!allObjects.length) {
    return []
  }

  return allObjects
}

export const searchByPresetHash = async (projectIdentifier, presetHash) => {
  return await api.call('get', `/projects/${ projectIdentifier }/files?preset=${ presetHash }`)
}

export const searchByContentType = async (projectIdentifier, contentType) => {
  return await api.call('get', `/projects/${ projectIdentifier }/files?contentType=${ encodeURIComponent(contentType) }`)
}

export const searchByProject = async (projectIdentifier) => {
  return await api.call('get', `/projects/${ projectIdentifier }/files`)
}
