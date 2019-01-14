import { searchByProject } from './search'

const invalidateByProject = async (projectIdentifier) => {
  const files = await searchByProject(projectIdentifier)

  if (files.length) {
    // delete on s3
    await s3.delete(files)
  }

  return null
}

export default invalidateByProject
