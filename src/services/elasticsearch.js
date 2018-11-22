import elasticsearch from 'infrastructure/elasticsearch'
import config from 'infrastructure/config'

const PREFIX = config.aws.elasticsearch.prefix
const TYPE_NAME = `${ PREFIX }-media`
const PAGE_SIZE = 10

const searchWithParams = async (projectIdentifier, params, { from, size }) => {
  return await elasticsearch.search({
    from,
    size,
    index: `${ PREFIX }-${ projectIdentifier }`,
    type: TYPE_NAME,
    body: {
      query: {
        ...params
      }
    }
  })
}

const searchWithoutParams = async (projectIdentifier, { from, size }) => {
  return await elasticsearch.search({
    from,
    size,
    index: `${ PREFIX }-${ projectIdentifier }`,
    type: TYPE_NAME
  })
}

export default {
  async initMapping(index, type, mapping) {
    const indexExists = await elasticsearch.indices.exists({
      index: `${ PREFIX }-${ index }`
    })

    if (indexExists) {
      return
    }

    await elasticsearch.indices.create({
      index: `${ PREFIX }-${ index }`
    })

    return await elasticsearch.indices.putMapping({
      index: `${ PREFIX }-${ index }`,
      type: `${ PREFIX }-${ type }`,
      body: {
        properties: mapping
      }
    })
  },
  async createOrUpdate(index, type, id, params) {
    const objectExists = await elasticsearch.exists({
      index: `${ PREFIX }-${ index }`,
      type: `${ PREFIX }-${ type }`,
      id
    })

    if (objectExists) {
      return await elasticsearch.update({
        index: `${ PREFIX }-${ index }`,
        type: `${ PREFIX }-${ type }`,
        id,
        body: {
          doc: params
        }
      })
    } else {
      return await elasticsearch.create({
        index: `${ PREFIX }-${ index }`,
        type: `${ PREFIX }-${ type }`,
        id,
        body: params
      })
    }
  },
  async searchAllObjects(projectIdentifier, params) {
    const projectExists = await elasticsearch.indices.exists({
      index: `${ PREFIX }-${ projectIdentifier }`
    })

    if (!projectExists) {
      return []
    }

    let totalHits = 0
    let total = 0
    let sources = []

    do {
      const {
        hits: {
          total: _total,
          hits
        }
      } = params ?
        await searchWithParams(
          projectIdentifier,
          params,
          {
            from: totalHits,
            size: PAGE_SIZE
          }
        ) :
        await searchWithoutParams(
          projectIdentifier,
          {
            from: totalHits,
            size: PAGE_SIZE
          }
        )

      totalHits = totalHits + hits.length
      total = _total

      sources = [
        ...sources,
        ...hits.map(({ _source }) => _source)
      ]
    } while (totalHits < total)

    return sources
  }
}
