import request from 'superagent'

import config from 'infrastructure/config'

const migrate = async (maxKeys) => {
  console.log('maxKeys', maxKeys)
  console.log('Run migration data please wait ...')
  let continuationToken

  do {
    try {
      const {
        body : { nextContinuationToken, message, isTruncated } } = await request
        .post(config.serverMigration)
        .set('Content-Type', 'application/json')
        .send({
          projectIdentifier: config.projectIdentifier,
          continuationToken,
          maxKeys
      })
      continuationToken = nextContinuationToken
      console.log("MESSAGE =>>", message)
      console.log("IS_TRUNCATED =>>", isTruncated)
    } catch (error) {
      console.log(error)
    }
  } while (continuationToken)

  console.log('Run migration finish')
}

migrate(10)
