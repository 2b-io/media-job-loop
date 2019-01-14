import api from 'services/api'
import cloudfront from 'services/cloudfront'
import { searchByContentType } from './search'
import s3 from 'services/s3'

const invalidateBycontentType = async (projectIdentifier, contentType) => {
  const files = await searchByContentType(projectIdentifier, contentType)

  // delete on s3
  if (files.length) {
    await s3.delete(files)
  }

  // delete on cloudfront
  const { ref: distributionId } = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  await cloudfront.createInvalidation(distributionId, [ '/*' ])

  return null
}

export default invalidateBycontentType
