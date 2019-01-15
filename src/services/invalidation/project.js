import { searchByProject } from './search'
import s3 from 'services/s3'

const invalidateByProject = async (projectIdentifier) => {
  const files = await searchByProject(projectIdentifier)

  if (files.length) {
    // delete on s3
    await s3.delete(files)
  }

  return null
}

export default invalidateByProject
