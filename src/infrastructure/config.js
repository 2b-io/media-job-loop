export default {
  server: {
    base: process.env.BASE_URL,
    bind: process.env.SERVER_BIND,
    port: process.env.SERVER_PORT
  },
  amq: {
    host: process.env.AMQ_HOST,
    prefix: process.env.AMQ_PREFIX
  },
  serverMigration: process.env.SERVER_MIGRATION,
  projectIdentifier: process.env.PROJECT_IDENTIFIER
}
