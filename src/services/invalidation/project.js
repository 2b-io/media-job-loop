import common from './common'

const invalidateByProject = async (projectIdentifier) => {
  return await common.invalidateAll(projectIdentifier)
}

export default invalidateByProject
