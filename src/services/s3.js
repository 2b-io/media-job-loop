import config from 'infrastructure/config'
import s3 from 'infrastructure/s3'

const MAX_KEYS = 10

export default {
  async delete(keys) {
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
  },
}
