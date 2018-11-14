import rpc from 'services'
import config from 'infrastructure/config'

import app from './app'

const { server: { port, bind } } = config

const main = async () => {
  app.listen(port, bind, () => {
    console.log(`Server start at ${ bind }:${ port }`)
  })
}

main()
