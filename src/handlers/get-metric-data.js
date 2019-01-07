import ms from 'ms'

import api from 'services/api'
import cloudwatch from 'services/cloudwatch'

const PERIOD = 60
const MAX_DATAPOINT = 1440

const MAX_DATAPOINT_UPDATE = 100

export default async (job) => {
  const {
    name,
    when,
    payload: {
      projectIdentifier,
      metricName,
      startTime
    }
  } = job

  const maxEndTime = Date.parse(startTime) + (PERIOD * 1000 * MAX_DATAPOINT)
  const now = Date.now()

  const endTime = maxEndTime < now ? maxEndTime : now

  console.log('GET_DATA_FROM_CLOUD_WATCH ...')

  const { isActive, isDeleted } = await api.call('get', `/projects/${ projectIdentifier }`)

  if (!isActive || isDeleted) {
    return null
  }

  const { ref: distributionIdentifier } = await api.call('get', `/projects/${ projectIdentifier }/infrastructure`)

  const { datapoints } = await cloudwatch.getMetric({
    distributionIdentifier,
    name: metricName,
    period: PERIOD,
    startTime,
    endTime: new Date(endTime).toISOString()
  })

  if (datapoints.length) {
    let datapointFrom = 0
    do {
      const subDatapoints = datapoints.slice(datapointFrom, datapointFrom + MAX_DATAPOINT_UPDATE)

      await api.call('patch', `/projects/${ projectIdentifier }/metrics/${ metricName.toLowerCase() }/datapoints`, subDatapoints)

      datapointFrom = datapointFrom + subDatapoints.length
    } while (datapointFrom < datapoints.length)
  }
  console.log('UPDATE_METRIC_DATA_SUCCESS')

  return {
    name,
    when: maxEndTime < now ? now : now + ms('1h'),
    payload: {
      projectIdentifier,
      metricName,
      startTime: new Date(endTime - ms('5m')).toISOString(),
    }
  }
}
