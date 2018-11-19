import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  project: {
    type: String,
    required: true,
    index: true
  },
  datapoints: [
    {
      timestamp: Number,
      value: Number
    }
  ]
})

export default mongoose.model('Report', schema)
