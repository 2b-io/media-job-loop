import request from 'superagent'

import config from 'infrastructure/config'
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

const getDistribution = async (distributionIdentifier) => {
  const response = await request
    .get(`${ config.cdnServer }/distributions/${ distributionIdentifier }`)
    .set('Content-Type', 'application/json')

  return response.body
}

const getProjectByIdentifier = async (identifier) => {
  return await Project.findOne({
    identifier
  })
}

const getInfrastructure= async (projectID) => {
  return await infrastructure.findOne({
    project: projectID
  })
}

export default {
  updateStatusProject,
  getProjectByIdentifier,
  getDistribution,
  getInfrastructure
}
