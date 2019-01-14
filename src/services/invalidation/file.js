import api from 'services/api'

const searchByPatterns = async (projectIdentifier, patterns) => {
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

const searchByPresetHash = async (projectIdentifier, presetHash) => {
  return await api.call('get', `/projects/${ projectIdentifier }/files?preset=${ presetHash }`)
}

const searchByContentType = async (projectIdentifier, contentType) => {
  return await api.call('get', `/projects/${ projectIdentifier }/files?contentType=${ encodeURIComponent(contentType) }`)
}

const searchByProject = async (projectIdentifier) => {
  return await api.call('get', `/projects/${ projectIdentifier }/files`)
}

export default {
  searchByContentType,
  searchByPatterns,
  searchByPresetHash,
  searchByProject
}
