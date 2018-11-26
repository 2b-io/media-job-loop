import ms from 'ms'

import cloudfront from 'infrastructure/cloudfront'
import config from 'infrastructure/config'
import route53 from 'services/route-53'

const s = (text) => ms(text) / 1000

const createDistributionConfig = ({
  enabled = true,
  acmCertificateArn,
  targetOriginDomain,
  reference,
  comment = '',
  aliases = []
}) => ({
  DistributionConfig: {
    CallerReference: reference,
    Aliases: {
      Quantity: aliases.length,
      Items: aliases
    },
    DefaultRootObject: '',
    Origins: {
      Quantity: 1,
      Items: [
        {
          Id: `ELB-${ targetOriginDomain }`,
          DomainName: targetOriginDomain,
          OriginPath: '',
          CustomHeaders: {
            Quantity: 0,
            Items: []
          },
          CustomOriginConfig: {
            HTTPPort: 80,
            HTTPSPort: 443,
            OriginProtocolPolicy: 'http-only',
            OriginSslProtocols: {
              Quantity: 3,
              Items: [ 'TLSv1', 'TLSv1.1', 'TLSv1.2' ]
            },
            OriginReadTimeout: 30,
            OriginKeepaliveTimeout: 5
          }
        }
      ]
    },
    DefaultCacheBehavior: {
      TargetOriginId: `ELB-${ targetOriginDomain }`,
      ForwardedValues: {
        QueryString: true,
        Cookies: {
          Forward: 'none'
        },
        Headers: {
          Quantity: 7,
          Items: [
            'Access-Control-Allow-Headers',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Origin',
            'Access-Control-Request-Headers',
            'Access-Control-Request-Method',
            'Host',
            'Origin'
          ]
        },
        QueryStringCacheKeys: {
          Quantity: 0,
          Items: []
        }
      },
      TrustedSigners: {
        Enabled: false,
        Quantity: 0,
        Items: []
      },
      ViewerProtocolPolicy: 'allow-all',
      MinTTL: 0,
      AllowedMethods: {
        Quantity: 7,
        Items: [
          'HEAD',
          'DELETE',
          'POST',
          'GET',
          'OPTIONS',
          'PUT',
          'PATCH'
        ],
        CachedMethods: {
          Quantity: 2,
          Items: [ 'HEAD', 'GET' ]
        }
      },
      SmoothStreaming: false,
      DefaultTTL: 86400,
      MaxTTL: 31536000,
      Compress: true,
      LambdaFunctionAssociations: {
        Quantity: 0,
        Items: []
      }
    },
    CacheBehaviors: {
      Quantity: 0,
      Items: []
    },
    CustomErrorResponses: {
      Quantity: 11,
      Items: [
        {
          ErrorCode: 400,
          ResponsePagePath: '',
          ResponseCode: '',
          ErrorCachingMinTTL: s('30s')
        },
        {
          ErrorCode: 403,
          ResponsePagePath: '',
          ResponseCode: '',
          ErrorCachingMinTTL: s('30s')
        },
        {
          ErrorCode: 404,
          ResponsePagePath: '',
          ResponseCode: '',
          ErrorCachingMinTTL: s('5m')
        },
        {
          ErrorCode: 405,
          ResponsePagePath: '',
          ResponseCode: '',
          ErrorCachingMinTTL: s('1d')
        },
        {
          ErrorCode: 414,
          ResponsePagePath: '',
          ResponseCode: '',
          ErrorCachingMinTTL: s('90d')
        },
        {
          ErrorCode: 416,
          ResponsePagePath: '',
          ResponseCode: '',
          ErrorCachingMinTTL: s('90d')
        },
        {
          ErrorCode: 500,
          ResponsePagePath: '',
          ResponseCode: '',
          ErrorCachingMinTTL: s('30s')
        },
        {
          ErrorCode: 501,
          ResponsePagePath: '',
          ResponseCode: '',
          ErrorCachingMinTTL: s('1d')
        },
        {
          ErrorCode: 502,
          ResponsePagePath: '',
          ResponseCode: '',
          ErrorCachingMinTTL: s('15s')
        },
        {
          ErrorCode: 503,
          ResponsePagePath: '',
          ResponseCode: '',
          ErrorCachingMinTTL: s('15s')
        },
        {
          ErrorCode: 504,
          ResponsePagePath: '',
          ResponseCode: '',
          ErrorCachingMinTTL: s('30s')
        }
      ]
    },
    Comment: comment,
    Logging: {
      Enabled: false,
      IncludeCookies: false,
      Bucket: '',
      Prefix: ''
    },
    Enabled: enabled,
    PriceClass: 'PriceClass_All',
    ViewerCertificate: {
      ACMCertificateArn: acmCertificateArn,
      SSLSupportMethod: 'sni-only',
      MinimumProtocolVersion: 'TLSv1.1_2016',
      Certificate: acmCertificateArn,
      CertificateSource: 'acm'
    },
    Restrictions: {
      GeoRestriction: {
        RestrictionType: 'none',
        Quantity: 0,
        Items: []
      }
    },
    WebACLId: '',
    HttpVersion: 'http2',
    IsIPV6Enabled: true
  }
})

const createDistribution = async (projectIdentifier, params) => {
  const {
    HostedZone: {
      Name: domain
    }
  } = await route53.getHostedZone()

  const normalizedDomain = domain.split('.').filter(Boolean).join('.')

  const alias = `${ projectIdentifier }.${ normalizedDomain }`

  const distributionConfig = createDistributionConfig({
    reference: Date.now().toString(),
    ...params,
    aliases: [ alias ],
    acmCertificateArn: config.aws.cloudfront.acmCertificateArn,
    targetOriginDomain: config.aws.cloudfront.targetOriginDomain
  })

  const { Distribution: distribution } = await cloudfront.createDistribution(distributionConfig).promise()

  await route53.createRecordSet(alias, distribution.DomainName)

  return {
    distribution,
    domain: alias
  }
}

const getDistribution = async (distributionId) => {
  return await cloudfront.getDistribution({
    Id: distributionId
  }).promise()
}

const updateDistribution = async (distributionId, data) => {
  const {
    DistributionConfig: distributionConfig,
    ETag: eTag
  } = await cloudfront.getDistributionConfig({
    Id: distributionId
  }).promise()

  return await cloudfront.updateDistribution({
    Id: distributionId,
    IfMatch: eTag,
    DistributionConfig: {
      ...distributionConfig,
      Enabled: data.enabled
    }
  }).promise()
}

export default {
  createDistribution,
  getDistribution,
  updateDistribution
}
