import ms from 'ms'

import cloudWatch from 'services/cloud-watch'
import da from 'services/da'

const updateReport = async (job) => {
  const {
    name,
    when,
    payload: {
      distributionIdentifier,
      name: metricName,
      period,
      startTime,
      endTime
    }
  } = job

  console.log('GET_DATA_FROM_CLOUD_WATCH ...')

  try {
    const { datapoints } = await cloudWatch.getMetric({
      distributionIdentifier,
      name: metricName,
      period,
      startTime,
      endTime
    })

    const { project: projectID } = await da.getInfrastructure(distributionIdentifier)

    await da.updateMetricDataReport(metricName, projectID, datapoints)

    console.log('UPDATE_METRIC_DATA_SUCCESS')

    return {
      name,
      when: when + ms('1h'),
      payload: {
        distributionIdentifier,
        name: metricName,
        period,
        startTime: startTime + ms('1h'),
        endTime: endTime + ms('1h')
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export default {
  updateReport
}
