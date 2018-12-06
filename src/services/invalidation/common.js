import api from 'services/api'
import cloudfront from 'services/cloudfront'
import elasticsearch from 'services/elasticsearch'

export default {
  async searchByPatterns(projectIdentifier, patterns) {
    const originObjects = await patterns.reduce(
      async (previousJob, pattern) => {
        const prevObjects = await previousJob || []
        const nextObjects = await elasticsearch.searchAllObjects({
          projectIdentifier,
          params: {
            regexp: {
              originUrl: pattern.endsWith('*') ?
                `${ escape(pattern.substring(0, pattern.length - 1)) }.*` :
                `${ escape(pattern) }.*`
            }
          }
        })

        return [ ...prevObjects, ...nextObjects ]
      }, Promise.resolve()
    )

    if (!originObjects.length) {
      return []
    }

    const allObjects = await originObjects.reduce(
      async (previousJob, { key: originKey }) => {
        const prevObjects = await previousJob || []
        const nextObjects = await elasticsearch.searchAllObjects({
          projectIdentifier,
          params: {
            regexp: {
              key: `${ escape(originKey) }.*`
            }
          }
        })

        return [ ...prevObjects, ...nextObjects ]
      }, Promise.resolve()
    )

    return allObjects
  },
  async searchByPresetHash(projectIdentifier, presetHash) {
    return await elasticsearch.searchAllObjects({
      projectIdentifier,
      params: {
        term: {
          preset: presetHash
        }
      }
    })
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
