import cloudfront from 'infrastructure/cloudfront'

const getDistribution = async (distributionIdentifier) => {
  return await cloudfront.getDistribution({
    Id: distributionIdentifier
  }).promise()
}


async invalidate(distributionId, patterns = []) => {
  const params = {
    DistributionId: distributionId,
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: {
        Quantity: patterns.length,
        Items: patterns
      }
    }
  }

  return await cloudfront.createInvalidation(params).promise()
}

const getInvalidation = async (distributionIdentifier, invalidationIdentifier) => {
  return await cloudfront.getInvalidation({
    DistributionId: distributionIdentifier,
    Id: invalidationIdentifier
  }).promise()
}

export default {
  getDistribution
}
