import cloudfront from 'infrastructure/cloudfront'

const getDistribution = async (distributionIdentifier) => {
  return await cloudfront.getDistribution({
    Id: distributionIdentifier
  }).promise()
}

export default {
  getDistribution
}
