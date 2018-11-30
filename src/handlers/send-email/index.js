import Email from 'email-templates'
import path from 'path'

import smtp from 'infrastructure/smtp'

const template = (name) => path.join(__dirname, 'templates', name)

const emailService = new Email({
  ...smtp,
  views: {
    options: {
      extension: 'ect'
    }
  }
})

export default async (job) => {
  const result = await emailService.send({
    template: template('welcome'),
    message: {
      to: 'd@dapps.me'
    },
    locals: {
      name: 'Peter Smith'
    }
  })

  console.log(result)

  return null
}
