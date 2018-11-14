import consumer from './consumer'
import producer from './producer'

export default {
  createConsumer: () => consumer(),
  createProducer: () => producer()
}
