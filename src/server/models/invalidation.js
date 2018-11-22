import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  identifier: {
    type: String,
    required: true,
    index: true
  }
  patterns: [ String ],
  status: {
    type: String
  },
  createdAt: {
    type: Number
  }
})

export default mongoose.model('Invalidation', schema)
