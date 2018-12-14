import config from 'infrastructure/config'
import api from 'services/api'

export default async (job) => {
  const { accountIdentifier, token } = job.payload
  console.log(' accountIdentifier, token',  accountIdentifier, token)
  const account = await api.call('get', `/accounts/${ accountIdentifier }`)

  return {
    template: 'password-recovery',
    to: config.sendgrid.sender,
    receivers: account.email,
    locals: {
      name: account.name,
      resetLink: `${ config.serverBind }:${ config.serverPort }/reset-password/${ token }`
    }
  }
}
