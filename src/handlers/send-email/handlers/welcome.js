import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  const { accountIdentifier } = job.payload

  const account = await api.call('get', `/accounts/${ accountIdentifier }`)
  const resetToken = await api.call('post', '/reset-tokens', { email: account.email } )

  return {
    template: 'welcome',
    to: config.sendgrid.sender,
    receivers: email,
    locals: {
      email,
      activateLink: `${ config.serverBind }:${ config.serverPort }/reset-password/${ resetToken.token }`
    }
  }
}
