export default {
  apiUrl: process.env.API_URL,
  migrateSever: process.env.MIGRATE_SEVER,
  server: {
    base: process.env.BASE_URL,
    bind: process.env.SERVER_BIND,
    port: process.env.SERVER_PORT
  },
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
    elasticSearch: {
      host: process.env.AWS_ELASTIC_SEARCH_HOST,
      prefix: process.env.AWS_ELASTIC_SEARCH_PREFIX
    },
    route53: {
      region: process.env.AWS_ROUTE53_REGION,
      accessKeyId: process.env.AWS_ROUTE53_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_ROUTE53_SECRET_ACCESS_KEY,
      hostedZoneId: process.env.AWS_ROUTE53_HOSTED_ZONE_ID
    }
  },
  pulling: {
    shortBreak: process.env.PULLING_SHORT_BREAK,
    longBreak: process.env.PULLING_LONG_BREAK
  }
}
