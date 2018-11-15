import producer from 'services/producer'

export default async (req, res) => {
  const { name, when, payload } = req.body

  try {
    producer({ name, when, payload })
    res.status(200).json("success")
  } catch (e) {
    res.status(500).json(serializeError(e))
  }
}
