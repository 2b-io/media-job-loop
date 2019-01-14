import { URL } from 'url'

import api from 'services/api'
import cloudfront from 'services/cloudfront'
import s3 from 'services/s3'
import file from './file'

const normalizePattern = (path, pullUrl) => {
  try {
    if (path.startsWith('/')) {
      return new URL(path, pullUrl || undefined).toString()
    }

    return new URL(`/${ path }`, pullUrl || undefined).toString()
  } catch (e) {
    return null
  }
}

const invalidateByPatterns = async (projectIdentifier, invalidationIdentifier) => {
  const { patterns } = await api.call(
    'get',
    `/projects/${ projectIdentifier }/invalidations/${ invalidationIdentifier }`
  )

  const project = await api.call('get', `/projects/${ projectIdentifier }`)

  const { ref: distributionId } = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  //check patterns = * or /*
  if (patterns.indexOf('*') !== -1 || patterns.indexOf('/*') !== -1 ) {
    // get all files in project
    const listFiles = await file.searchByProject(projectIdentifier)

    if (listFiles.length) {
      // delete on s3
      await s3.delete(listFiles)
    }

    return await cloudfront.createInvalidation(distributionId, [ '/*' ])
  }

  const { pullUrl } = await api.call('get', `/projects/${ projectIdentifier }/pull-setting`)

  const normalizedPatterns = patterns.map(
    (pattern) => normalizePattern(pattern, pullUrl)
  ).filter(Boolean)

  if (normalizedPatterns.length) {
    const listFiles = await file.searchByPatterns(projectIdentifier, normalizedPatterns)

    if (listFiles.length) {
      // delete on s3
      await s3.delete(listFiles)
    }
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

      return await cloudfront.createInvalidation(distributionId, cloudfrontPatterns)
  } else {
    return await cloudfront.createInvalidation(distributionId, patterns)
  }
}

export default invalidateByPatterns
