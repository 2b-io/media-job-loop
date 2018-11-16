import mongoose from 'infrastructure/mongoose'

const schema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  identifier: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String
  },
  status: {
    type: String
  },
  createdAt: {
    type: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
})

export default mongoose.model('Project', schema)
