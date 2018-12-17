import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  const { accountIdentifier, resetLink } = job.payload
  const account = await api.call('get', `/accounts/${ accountIdentifier }`)

  return {
    template: 'password-recovery',
    to: config.sendgrid.sender,
    receivers: account.email,
    locals: {
      name: account.name,
      resetLink
    }
  }
}
