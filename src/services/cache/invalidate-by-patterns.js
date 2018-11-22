import serializeError from 'serialize-error'
import { URL } from 'url'

import cloudfront from 'services/cloudfront'
import da from 'services/da'
import handler from './handler'
import s3 from 'services/s3'

const normalizePattern = (path, pullURL) => {
  try {
    return new URL(path, pullURL || undefined).toString()
  } catch (e) {
    return null
  }
}

const invalidateByPatterns = async (projectIdentifier, patterns, options) => {
  if (patterns.indexOf('*') !== -1 || patterns.indexOf('/*') !== -1 ) {
    // delete all files in project
    return await handler.invalidateAll(projectIdentifier, options)
  }

  const project = await da.getProjectByIdentifier(projectIdentifier)
  const { pullURL } = await da.getPullSetting(project._id)

  const normalizedPatterns = patterns
    .map(
      (pattern) => normalizePattern(pattern, pullURL)
    )
    .filter(Boolean)

  if (normalizedPatterns.length) {
    if (options.deleteOnS3) {
      const allObjects = await handler.searchByPatterns(projectIdentifier, normalizedPatterns)

      if (allObjects.length) {
        // delete on s3
        await s3.delete(allObjects)
      }
    }

    if (options.deleteOnDistribution) {
      const { identifier: distributionId } = await da.getInfrastructureByProject(project._id)

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
                pretty: pullURL && pattern.indexOf(pullURL) === 0 ?
                  `${ pattern.replace(pullURL, '') }` :
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
                pretty: pullURL && pattern.indexOf(pullURL) === 0 ?
                  `${ pattern.replace(pullURL, '') }*` :
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
