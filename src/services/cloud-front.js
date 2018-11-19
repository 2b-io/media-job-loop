import cloudFront from 'infrastructure/cloud-front'

const getDistribution = async (distributionIdentifier) => {
  return await cloudFront.getDistribution({
    Id: distributionIdentifier
  }).promise()
}

export default {
  getDistribution
}
