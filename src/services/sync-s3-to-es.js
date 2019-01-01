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
  } = await s3.list({ params })

  const { expiredS3Objects } = await contents.reduce(
    async (previousJob, file) => {
      const { expiredS3Objects } = await previousJob

      try {
        const { Key: key } = file
        const projectIdentifier = key.split('/')[1]
        console.log('PUSH_FILE -> ', key)

        const s3Object = await retry(10)(s3.head)(key)

        // check expire
        const { Expires: expires } = s3Object

        if (!expires || expires < Date.now()) {
          console.log(`${ key } IS EXPIRED...`)

          return { expiredS3Objects: [ ...expiredS3Objects, key ] }
        }

        const objectElasticsearch = formatObjects3toES(s3Object, key, lastSynchronized)

        try {
          await api.call(
            'head',
            `/projects/${ projectIdentifier }/files/${ encodeURIComponent(key) }`
          )

          const { originUrl, isOrigin, expires, lastModified, lastSynchronized } = objectElasticsearch

          return await api.call(
            'put',
            `/projects/${ projectIdentifier }/files/${ encodeURIComponent(key) }`,
            { originUrl, expires, isOrigin, lastModified, lastSynchronized }
          )
        } catch (e) {
          console.log('FILE NOT FOUND')
          return await api.call('post', `/projects/${ projectIdentifier }/files`, { ...objectElasticsearch })
        }
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

  if (expiredS3Objects) {
    const deleteResult = await s3.delete(expiredS3Objects)

    console.log(deleteResult)
  }

  return {
    isTruncated,
    nextContinuationToken
  }
}

export default async (projectIdentifier, continuationToken, lastSynchronized, maxKeys) => {

    const fileS3Version = `${ config.aws.s3.version }/${ projectIdentifier }`

    const {
      isTruncated,
      nextContinuationToken
    } = await fetchPage(
      continuationToken,
      lastSynchronized,
      fileS3Version,
      maxKeys
    )

    return {
      isTruncated,
      nextContinuationToken
    }
}
