import Report from 'server/models/report'
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

const getInfrastructure= async (distributionIdentifier) => {
  return await infrastructure.findOne({
    identifier: distributionIdentifier
  })
}

const updateMetricDataReport = async (name, projectID, datapoints) => {
  return await Report.findOneAndUpdate({
    name,
    project: projectID
  }, {
    datapoints
  }, {
    upsert: true,
    new: true
  }).lean()
}

export default {
  updateStatusProject,
  getProjectByIdentifier,
  getInfrastructureByProject,
  getInfrastructure,
  updateMetricDataReport
}
