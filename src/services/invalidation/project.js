import file from './file'

const invalidationByProject = async (projectIdentifier) => {
  const listFiles = await file.searchByProject(projectIdentifier)

  if (listFiles.length) {
    // delete on s3
    await s3.delete(listFiles)
  }

  return null
}

export default invalidationByProject
