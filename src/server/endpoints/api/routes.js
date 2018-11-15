import serializeError from 'serialize-error'

import jobController from './controllers/job'

export default (app) => {
  app.post('/jobs', jobController.create)

  app.use((error, req, res, next) => {
    res.status(500).json({
      error: serializeError(error)
    })
  })
}
