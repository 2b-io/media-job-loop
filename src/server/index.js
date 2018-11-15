import app from './app'
import config from 'infrastructure/config'

const { server: { port, bind } } = config

const main = () => {
  app.listen(port, bind, () => {
    console.log(`Server start at ${ bind }:${ port }`)
  })
}

main()
