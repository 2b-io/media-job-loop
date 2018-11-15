import express from 'express'

import api from 'endpoints/api'

const app = express()

app.use('/api/v1', api)

export default app
