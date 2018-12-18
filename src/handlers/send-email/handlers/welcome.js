import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  const { email, activateLink } = job.payload

  return {
    template: 'welcome',
    to: config.sendgrid.sender,
    receivers: email,
    locals: {
      email,
      activateLink
    }
  }
}
