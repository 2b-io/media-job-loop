import config from 'infrastructure/config'
import producer from 'services/producer'
import createProducer from 'services/producer'

export default async (req, res) => {
  const { name, when, payload } = req.body

  try {
    const producer = await createProducer({
      host: config.amq.host,
      queue: config.amq.queue,
      message: {
        name,
        when,
        payload
      }
    })
    producer.sendToQueue()

    res.status(200).json("success")
  } catch (e) {
    res.status(500).json((e))
  }
}
