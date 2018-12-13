import config from 'infrastructure/config'

export default async (job) => {
  const { email, resetToken } = job.payload

  return {
    template: 'welcome',
    to: config.sendgrid.sender,
    receivers: email,
    locals: {
      email,
      activateLink: `${ config.serverBind }:${ config.serverPort }/reset-password/${ resetToken }`
    }
  }
}
