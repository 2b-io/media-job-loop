import aws from 'aws-sdk'

import config from 'infrastructure/config'

export default new aws.CloudFront({
  region: config.aws.cloudfront.region,
  accessKeyId: config.aws.cloudfront.accessKeyId,
  secretAccessKey: config.aws.cloudfront.secretAccessKey
})
