import Email from 'email-templates'
import path from 'path'

import smtp from 'infrastructure/smtp'

import * as handlers from './handlers'

const HANDLERS = {
  'INVITATION': handlers.invitation,
  'PASSWORD_RECOVERY': handlers.passwordRecovery,
  'WELCOME': handlers.welcome
}

const emailService = new Email({
  ...smtp,
  views: {
    options: {
      extension: 'ect'
    }
  }
})

const getTemplateDir = (name) => path.join(__dirname, 'templates', name)

export default async (job) => {
  const handler = HANDLERS[job.payload.type]

  if (!handler || typeof handler !== 'function') {
    return
  }

  const { template, receivers, locals } = await handler(job)

  const result = await emailService.send({
    template: getTemplateDir(template),
    message: {
      to: receivers
    },
    locals
  })

  console.log(result)
}
