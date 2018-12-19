import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  const { email, activateLink, inviterName, inviterEmail, message } = job.payload

  return {
    template: 'invitation',
    to: config.sendgrid.sender,
    receivers: email,
    locals: {
      inviterEmail,
      inviterName,
      message,
      activateLink
    }
  }
}
