import Project from 'server/models/project'
import infrastructure from 'server/models/infrastructure'

const updateStatusProject = async (projectId, status, isActive) => {
  return await Project.findOneAndUpdate({
    _id: projectId
  }, {
    status,
    isActive
  }, {
    new: true
  }).lean()
}

const getProjectByIdentifier = async (identifier) => {
  return await Project.findOne({
    identifier
  })
}

const getInfrastructureByProject = async (projectId) => {
  return await infrastructure.findOne({
    project: projectId
  })
}

const getInfrastructure = async (distributionIdentifier) => {
  return await infrastructure.findOne({
    identifier: distributionIdentifier
  })
}

const getProject = async (projectId) => {
  return await Project.findOne({
    _id: projectId
  })
}

const getPullSetting = async (projectId) => {
  return
}

export default {
  updateStatusProject,
  getProjectByIdentifier,
  getInfrastructureByProject,
  getInfrastructure,
  getProject,
  getPullSetting
}
