import api from 'services/api'
import cloudfront from 'services/cloudfront'
import handler from './handler'
import s3 from 'services/s3'

const invalidateByPreset = async (projectIdentifier, presetHash) => {

  const allObjects = await handler.searchByPresetHash(projectIdentifier, presetHash)

  // delete on s3
  if (allObjects.length) {
    await s3.delete(allObjects)
  }

  // delete on cloudfront
  const { identifier: distributionId } = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  await cloudfront.createInvalidate(distributionId, [ '/*' ])
}

export default invalidateByPreset
