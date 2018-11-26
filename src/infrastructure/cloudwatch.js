import aws from 'aws-sdk'

import config from 'infrastructure/config'

export default new aws.CloudWatch({
  region: config.aws.cloudwatch.region,
  accessKeyId: config.aws.cloudwatch.accessKeyId,
  secretAccessKey: config.aws.cloudwatch.secretAccessKey
})
