import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  const { receivers, activateLink } = job.payload

  return {
    template: 'welcome',
    to: config.sendgrid.sender,
    receivers: receivers,
    locals: {
      email,
      activateLink
    }
  }
}
