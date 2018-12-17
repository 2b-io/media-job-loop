import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  const { accountIdentifier, activateLink } = job.payload
  const account = await api.call('get', `/accounts/${ accountIdentifier }`)

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
