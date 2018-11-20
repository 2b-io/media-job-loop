import ms from 'ms'

import cloudWatch from 'services/cloud-watch'
import da from 'services/da'
import elasticSearch from 'services/elastic-search'
import reportMapping from 'server/mapping/report'

const PERIOD = 60
const MAX_DATAPOINT = 1440

const getMetricData = async (job) => {
  const {
    name,
    when,
    payload: {
      projectIdentifier,
      metricName,
      startTime
    }
  } = job

  const maxEndTime = startTime + (PERIOD * 1000 * MAX_DATAPOINT)
  const now = Date.now()

  const endTime = maxEndTime < now ? maxEndTime : now

  console.log('GET_DATA_FROM_CLOUD_WATCH ...')

  try {
    const { _id: projectId, isActive } = await da.getProjectByIdentifier(projectIdentifier)

    if (!isActive) {
      return null
    }

    const { identifier: distributionIdentifier } = await da.getInfrastructureByProject(projectId)

    const { datapoints } = await cloudWatch.getMetric({
      distributionIdentifier,
      name: metricName,
      period: PERIOD,
      startTime,
      endTime
    })

    if (datapoints.length) {
      await elasticSearch.initMapping(
        projectIdentifier,
        metricName,
        reportMapping
      )

      await datapoints.reduce(
        async (previousJob, datapoint) => {
          await previousJob

          const { timestamp, value } = datapoint

          try {
            return await elasticSearch.createOrUpdate(
              projectIdentifier,
              metricName,
              timestamp, {
                timestamp: new Date(timestamp),
                value
              }
            )
          } catch (error) {
            console.error(error)
          }
        },
        Promise.resolve()
      )
    }
    console.log('UPDATE_METRIC_DATA_SUCCESS')

    return {
      name,
      when: maxEndTime < now ? now : now + ms('1h'),
      payload: {
        projectIdentifier,
        metricName,
        startTime: endTime - ms('5m'),
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export default {
  getMetricData
}
