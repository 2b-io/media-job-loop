import api from 'services/api'
import cloudfront from 'services/cloudfront'
import common from './common'
import s3 from 'services/s3'

const invalidatePresetHash = async (projectIdentifier, presetHash) => {

  const allObjects = await common.searchByPresetHash(projectIdentifier, presetHash)

  // delete on s3
  if (allObjects.length) {
    await s3.delete(allObjects)
  }

  // delete on cloudfront
  const { ref: distributionId } = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  await cloudfront.createInvalidate(distributionId, [ '/*' ])
}

const invalidateContentType = async (projectIdentifier, contentType) => {

  const allObjects = await common.searchByContentType(projectIdentifier, contentType)

  // delete on s3
  if (allObjects.length) {
    await s3.delete(allObjects)
  }

  // delete on cloudfront
  const { identifier: distributionId } = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  await cloudfront.createInvalidate(distributionId, [ '/*' ])
}

export default {
  invalidateContentType,
  invalidatePresetHash
}
