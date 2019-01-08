import api from 'services/api'
import cloudfront from 'services/cloudfront'
import s3 from 'services/s3'

export default {
  async searchByPatterns(projectIdentifier, patterns) {
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
  },
  async searchByPresetHash(projectIdentifier, presetHash) {
    return await api.call('get', `/projects/${ projectIdentifier }/files?preset=${ presetHash }`)
  },
  async searchByContentType(projectIdentifier, contentType) {
    return await api.call('get', `/projects/${ projectIdentifier }/files?contentType=${ encodeURIComponent(contentType) }`)
  },
  async invalidateAll (projectIdentifier) {
    const allObjects = await api.call('get', `/projects/${ projectIdentifier }/files`)

    if (!allObjects.length) {
      return null
    }
    // delete on s3
    return await s3.delete(allObjects)
  }

}
