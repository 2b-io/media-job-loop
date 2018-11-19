import elasticSearch from 'infrastructure/elastic-search'
import config from 'infrastructure/config'

const PREFIX = config.aws.elasticSearch.prefix

export default {
  async initMapping(index, type, mapping) {
    const indexExists = await elasticSearch.indices.exists({
      index: `${ PREFIX }-${ index }`
    })

    if (indexExists) {
      return
    }

    await elasticSearch.indices.create({
      index: `${ PREFIX }-${ index }`
    })

    return await elasticSearch.indices.putMapping({
      index: `${ PREFIX }-${ index }`,
      type: `${ PREFIX }-${ type }`,
      body: {
        properties: mapping
      }
    })
  },
  async createOrUpdate(index, type, id, params) {
    const objectExists = await elasticSearch.exists({
      index: `${ PREFIX }-${ index }`,
      type: `${ PREFIX }-${ type }`,
      id
    })

    if (objectExists) {
      return await elasticSearch.update({
        index: `${ PREFIX }-${ index }`,
        type: `${ PREFIX }-${ type }`,
        id,
        body: {
          doc: params
        }
      })
    } else {
      return await elasticSearch.create({
        index: `${ PREFIX }-${ index }`,
        type: `${ PREFIX }-${ type }`,
        id,
        body: params
      })
    }
  }
}
