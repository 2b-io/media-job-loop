import express from 'express'
import morgan from 'morgan'

import api from 'server/endpoints/api'

const app = express()

app.use(morgan('dev'))
app.use('/api/v1', api)

export default app
