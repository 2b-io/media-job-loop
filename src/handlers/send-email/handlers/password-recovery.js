import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  const { receivers, resetLink } = job.payload

  return {
    template: 'password-recovery',
    to: config.sendgrid.sender,
    receivers,
    locals: {
      name: account.name,
      resetLink
    }
  }
}
