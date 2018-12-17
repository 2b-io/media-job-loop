import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  const { receivers, activateLink, inviterName, message } = job.payload

  return {
    template: 'invitation',
    to: config.sendgrid.sender,
    receivers,
    locals: {
      email: account.email,
      inviterName,
      message,
      activateLink
    }
  }
}
