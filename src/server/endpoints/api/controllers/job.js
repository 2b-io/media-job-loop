import config from 'infrastructure/config'
import producer from 'services/producer'


export default {
  async create(req, res, next) {
    const { name, when, payload } = req.body

    try {
      const producer = req.app.get('producer')

      await producer.sendMessage({
        name,
        when,
        payload
      })

      res.status(201).json({
        succeed: true
      })
    } catch (e) {
      next(e)
    }
  }
}
