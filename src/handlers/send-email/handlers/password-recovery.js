import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  const { email, accountName, resetLink } = job.payload

  return {
    template: 'password-recovery',
    to: config.sendgrid.sender,
    receivers: email,
    locals: {
      name: accountName,
      resetLink
    }
  }
}
