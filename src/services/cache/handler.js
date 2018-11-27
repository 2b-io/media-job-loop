import api from 'services/api'
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
  async invalidateAll (projectIdentifier, options) {
    if (options.deleteOnS3) {
      const allObjects = await await elasticsearch.searchAllObjects({
        projectIdentifier
      })

      if (allObjects.length) {
        // delete on s3
        await s3.delete(allObjects)
      }
    }

    if (options.deleteOnDistribution) {
      // delete on distribution

      const project = await api.call('get', `/projects/${ projectIdentifier }`)

      const infrastructure = await api.call('get', `/projects/${ project.identifier }/infrastructure`)

      await cloudfront.createInvalidate(infrastructure.identifier, [ '/*' ])
    }
  }

}
