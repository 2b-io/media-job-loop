export default {
  isDevMode: process.env.NODE_ENV === 'development',
  apiUrl: process.env.API_URL,
  apiSecretKey: process.env.API_SECRET_KEY,
  amq: {
    host: process.env.AMQ_HOST,
    queue: process.env.AMQ_QUEUE,
    prefix: process.env.AMQ_PREFIX
  },
  aws: {
    cloudfront: {
      region: process.env.AWS_CLOUDFRONT_REGION,
      accessKeyId: process.env.AWS_CLOUDFRONT_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_CLOUDFRONT_SECRET_ACCESS_KEY,
      acmCertificateArn: process.env.AWS_CLOUDFRONT_ACM_CERTIFICATE_ARN,
      targetOriginDomain: process.env.AWS_CLOUDFRONT_TARGET_ORIGIN_DOMAIN
    },
    cloudwatch: {
      region: process.env.AWS_CLOUDWATCH_REGION,
      accessKeyId: process.env.AWS_CLOUDWATCH_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_CLOUDWATCH_SECRET_ACCESS_KEY
    },
    route53: {
      region: process.env.AWS_ROUTE53_REGION,
      accessKeyId: process.env.AWS_ROUTE53_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_ROUTE53_SECRET_ACCESS_KEY,
      hostedZoneId: process.env.AWS_ROUTE53_HOSTED_ZONE_ID
    },
    s3: {
      bucket: process.env.AWS_S3_BUCKET,
      region: process.env.AWS_S3_REGION,
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      version: process.env.AWS_S3_VERSION
    }
  },
  sendgrid: {
    sender: process.env.SENDGRID_SENDER,
    apiKey: process.env.SENDGRID_API_KEY
  },
  pulling: {
    shortBreak: process.env.PULLING_SHORT_BREAK,
    longBreak: process.env.PULLING_LONG_BREAK
  }
}
