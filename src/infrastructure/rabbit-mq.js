import amqp from 'amqplib'

import config from 'infrastructure/config'

export default connect = amqp.connect(config.amq.host)
