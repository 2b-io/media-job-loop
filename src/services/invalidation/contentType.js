import api from 'services/api'
import cloudfront from 'services/cloudfront'
import file from './file'
import s3 from 'services/s3'

const contentType = async (projectIdentifier, contentType) => {
  const listFiles = await file.searchByContentType(projectIdentifier, contentType)

  // delete on s3
  if (listFiles.length) {
    await s3.delete(listFiles)
  }

  // delete on cloudfront
  const { ref: distributionId } = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  await cloudfront.createInvalidation(distributionId, [ '/*' ])

  return null
}

export default contentType
