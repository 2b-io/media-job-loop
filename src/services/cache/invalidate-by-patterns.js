import serializeError from 'serialize-error'
import { URL } from 'url'

import api from 'services/api'
import cloudfront from 'services/cloudfront'
import handler from './handler'
import config from 'infrastructure/config'
import s3 from 'services/s3'

const normalizePattern = (path, pullUrl) => {
  try {
    return new URL(path, pullUrl || undefined).toString()
  } catch (e) {
    return null
  }
}

const invalidateByPatterns = async (projectIdentifier, invalidationIdentifier, options = { deleteOnS3: true, deleteOnDistribution: true }) => {
  const { patterns } = await api.call('get', `/projects/${ projectIdentifier }/invalidations/${ invalidationIdentifier }`)

  const project = await api.call('get', `/projects/${ projectIdentifier }`)

  if (project.status !== 'DEPLOYED') {
    options.deleteOnDistribution = false
  }

  if (patterns.indexOf('*') !== -1 || patterns.indexOf('/*') !== -1 ) {
    // delete all files in project
    return await handler.invalidateAll(projectIdentifier, options)
  }

  const { pullUrl } = await api.call('get', `/projects/${ projectIdentifier }/pull-setting`)

  const normalizedPatterns = patterns
    .map(
      (pattern) => normalizePattern(pattern, pullUrl)
    )
    .filter(Boolean)

  const { identifier: distributionId } = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  if (normalizedPatterns.length) {
    if (options.deleteOnS3) {
      const allObjects = await handler.searchByPatterns(projectIdentifier, normalizedPatterns)

      if (allObjects.length) {
        // delete on s3
        await s3.delete(allObjects)
      }
    }

    if (options.deleteOnDistribution) {
      // delete on distribution
      const cloudfrontPatterns = normalizedPatterns
        .map(
          (pattern) => {
            const withoutQuerystring = pattern.split('?').shift()

            if (pattern.endsWith('*')) {
              return {
                universal: [
                  `/u?url=${ withoutQuerystring }`,
                  `/u?url=${ encodeURIComponent(withoutQuerystring) }`,
                  `/u?url=${ encodeURIComponent(pattern) }`,
                  `/u/?url=${ withoutQuerystring }`,
                  `/u/?url=${ encodeURIComponent(withoutQuerystring) }`,
                  `/u/?url=${ encodeURIComponent(pattern) }`
                ],
                pretty: pullUrl && pattern.indexOf(pullUrl) === 0 ?
                  `${ pattern.replace(pullUrl, '') }` :
                  null,
              }
            } else {
              return {
                universal: [
                  `/u?url=${ withoutQuerystring }*`,
                  `/u?url=${ encodeURIComponent(withoutQuerystring) }*`,
                  `/u?url=${ encodeURIComponent(pattern) }*`,
                  `/u/?url=${ withoutQuerystring }*`,
                  `/u/?url=${ encodeURIComponent(withoutQuerystring) }*`,
                  `/u/?url=${ encodeURIComponent(pattern) }*`
                ],
                pretty: pullUrl && pattern.indexOf(pullUrl) === 0 ?
                  `${ pattern.replace(pullUrl, '') }*` :
                  null,
              }
            }
          }
        )
        .reduce(
          (cloudfrontPatterns, pattern) => [
            ...cloudfrontPatterns,
            ...pattern.universal,
            pattern.pretty
          ], []
        )
        .filter(Boolean)

    return await cloudfront.createInvalidate(distributionId, cloudfrontPatterns)
    }
  } else {
    return await cloudfront.createInvalidate(distributionId, patterns)
  }
}

export default invalidateByPatterns
