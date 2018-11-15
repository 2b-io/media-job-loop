import createJobs from './controllers/jobs'

export default (app) => {
  app.post('/jobs', createJobs)
}
