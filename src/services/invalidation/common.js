import api from 'services/api'
import cloudfront from 'services/cloudfront'

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
    return await api.call('get', `/projects/${ projectIdentifier }/files?preset=${ presetHash}`)
  },
  async invalidateAll (projectIdentifier) {
    const allObjects = await api.call('get', `/projects/${ projectIdentifier }/files`)

    if (allObjects.length) {
      // delete on s3
      await s3.delete(allObjects)
    }

    const {
      identifier: distributionId
    } = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

    await cloudfront.createInvalidate(distributionId, [ '/*' ])

    return await cloudfront.updateDistribution(distributionId, { enabled: false })
  }

}
