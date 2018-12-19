import ms from 'ms'

import api from 'services/api'
import cloudwatch from 'services/cloudwatch'

const PERIOD = 60
const MAX_DATAPOINT = 1440

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

  const maxEndTime = startTime + (PERIOD * 1000 * MAX_DATAPOINT)
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
    endTime
  })

  if (datapoints.length) {
    await api.call('patch', `/projects/${ projectIdentifier }/metrics/${ metricName.toLowerCase() }/datapoints`, datapoints)
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
}
