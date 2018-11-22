import cloudfront from 'services/cloudfront'
import da from 'services/da'
import handler from './handler'
import s3 from 'services/s3'

const invalidateByPreset = async (projectIdentifier, presetHash) => {
  const project = await da.getProjectByIdentifier(projectIdentifier)
  const allObjects = await handler.searchByPresetHash(projectIdentifier, presetHash)

  // delete on s3
  if (allObjects.length) {
    await s3.delete(allObjects)
  }

  // delete on cloudfront
  const { identifier: distributionId } = await da.getInfrastructureByProjectId(project._id)

  await cloudfront.createInvalidate(distributionId, [ '/*' ])
}

export default invalidateByPreset
