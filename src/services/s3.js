import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'

const MAX_KEYS = 1000

const delete = async (keys) => {
  let keyFrom = 0
  do {
    const subKeys = keys.slice(keyFrom, keyFrom + MAX_KEYS)
    await s3.deleteObjects({
      Bucket: s3.config.bucket,
      Delete: {
        Objects: subKeys.map(({ key }) => ({ Key: key }))
      }
    }).promise()

    keyFrom = keyFrom + subKeys.length
  } while (keyFrom < keys.length)
}

const head = async (key) => {
  return await s3.headObject({
    Bucket: config.aws.s3.bucket,
    Key: key
  }).promise()
}

const list = async ({ params }) => {
  return await s3.listObjectsV2({
    Bucket: config.aws.s3.bucket,
    ...params
  }).promise()
}

export default {
  delete,
  head,
  list
}
