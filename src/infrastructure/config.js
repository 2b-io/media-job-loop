export default {
  apiUrl: process.env.API_URL,
  migrateSever: process.env.MIGRATE_SEVER,
  server: {
    base: process.env.BASE_URL,
    bind: process.env.SERVER_BIND,
    port: process.env.SERVER_PORT
  },
  amq: {
    host: process.env.AMQ_HOST,
    queue: process.env.AMQ_QUEUE,
    prefix: process.env.AMQ_PREFIX
  }
}
