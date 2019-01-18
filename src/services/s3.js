import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'

export default {
  async delete(keys = []) {
    let keyFrom = 0
    do {
      const subKeys = keys.slice(keyFrom, keyFrom + config.aws.s3.maxKeys)
      await s3.deleteObjects({
        Bucket: s3.config.bucket,
        Delete: {
          Objects: subKeys.map(({ key }) => ({ Key: key }))
        }
      }).promise()

      keyFrom = keyFrom + subKeys.length
    } while (keyFrom < keys.length)
  },
  async head(key) {
    return await s3.headObject({
      Bucket: config.aws.s3.bucket,
      Key: key
    }).promise()
  },
  async list({ params }) {
    return await s3.listObjectsV2({
      Bucket: config.aws.s3.bucket,
      ...params
    }).promise()
  }
}
