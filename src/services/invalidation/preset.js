import api from 'services/api'
import cloudfront from 'services/cloudfront'
import { searchByPresetHash } from './search'
import s3 from 'services/s3'

const invalidateBypresetHash = async (projectIdentifier, presetHash) => {
  const files = await searchByPresetHash(projectIdentifier, presetHash)

  // delete on s3
  if (files.length) {
    await s3.delete(files)
  }

  // delete on cloudfront
  const { ref: distributionId } = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  await cloudfront.createInvalidation(distributionId, [ '/*' ])

  return null
}

export default invalidateBypresetHash
