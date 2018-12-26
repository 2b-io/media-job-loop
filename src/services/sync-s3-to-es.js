import config from 'infrastructure/config'
import api from 'services/api'
import s3 from 'services/s3'
import retry from 'services/retry'
import formatObjects3toES from 'services/format-object-s3-to-es'

const fetchPage = async (
  continuationToken,
  lastSynchronized,
  prefix,
  maxKeys = 1000
) => {
  const params = {
    Prefix: prefix || null,
    MaxKeys: maxKeys,
    ContinuationToken: continuationToken || null
  }
  const {
    Contents: contents,
    NextContinuationToken: nextContinuationToken,
    IsTruncated: isTruncated
  } = await media.list({ params })

  const { expiredS3Objects } = await contents.reduce(
    async (previousJob, file) => {
      const { expiredS3Objects } = await previousJob

      try {
        const { Key: key } = file
        const projectIdentifier = key.split('/')[1]
        console.log('PUSH_FILE -> ', key)

        const s3Object = await retry(10)(media.head)(key)

        // check expire
        const { Expires: expires } = s3Object

        if (!expires || expires < Date.now()) {
          console.log(`${ key } IS EXPIRED...`)

          return { expiredS3Objects: [ ...expiredS3Objects, key ] }
        }

        const objectElasticsearch = formatObjects3toES(s3Object, key, lastSynchronized)

        const checkExistsObject = api.call(
          'head',
          `/projects/${ projectIdentifier }/files/${ encodeURIComponent(objectElasticsearch.key) }`
        )

        const {
          originUrl,
          isOrigin,
          lastModified,
          lastSynchronized
        } = objectElasticsearch

        if (checkExistsObject) {
          return await api.call(
            'put',
            `/projects/${ projectIdentifier }/files`,
            { originUrl, expires, isOrigin, lastModified, lastSynchronized }
          )
        }

        return await api.call('post', `/projects/${ projectIdentifier }/files`, { ...objectElasticsearch })
      } catch (error) {
        console.error(error)
      }

      return {
        expiredS3Objects
      }
    },
    Promise.resolve({
      expiredS3Objects: []
    })
  )

  if (expiredS3Objects.length) {
    const deleteResult = await s3.delete(expiredS3Objects)

    console.log(deleteResult)
  }

  return {
    expired: expiredS3Objects.length,
    isTruncated,
    nextContinuationToken
  }
}

export default async (projectIdentifier, continuationToken, lastSynchronized, maxKeys) => {

    const fileS3Version = `${ config.aws.s3.version }/${ projectIdentifier }`

    const {
      expired,
      isTruncated,
      nextContinuationToken
    } = await fetchPage(
      continuationToken,
      lastSynchronized,
      fileVersion,
      maxKeys
    )

    return {
      expired,
      isTruncated,
      nextContinuationToken
    }
}
