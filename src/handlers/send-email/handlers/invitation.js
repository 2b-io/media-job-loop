import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  const { accountIdentifier, inviterName, message } = job.payload
  const account = await api.call('get', `/accounts/${ accountIdentifier }`)
  const resetToken = await api.call('post', '/reset-tokens', { email: account.email } )

  return {
    template: 'invitation',
    to: config.sendgrid.sender,
    receivers: account.email,
    locals: {
      email: account.email,
      inviterName,
      message,
      activateLink: `${ config.serverBind }:${ config.serverPort }/reset-password/${ resetToken.token }`
    }
  }
}
