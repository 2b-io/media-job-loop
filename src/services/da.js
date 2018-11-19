import Project from 'server/models/project'
import infrastructure from 'server/models/infrastructure'

const updateStatusProject = async (projectID, status, isActive) => {
  return await Project.findOneAndUpdate({
    _id: projectID
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

const getInfrastructureByProject= async (projectID) => {
  return await infrastructure.findOne({
    project: projectID
  })
}

export default {
  updateStatusProject,
  getProjectByIdentifier,
  getInfrastructureByProject
}
