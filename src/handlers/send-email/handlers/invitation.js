import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  const { accountIdentifier, activateLink, inviterName, message } = job.payload
  const account = await api.call('get', `/accounts/${ accountIdentifier }`)

  return {
    template: 'invitation',
    to: config.sendgrid.sender,
    receivers: account.email,
    locals: {
      email: account.email,
      inviterName,
      message,
      activateLink
    }
  }
}
