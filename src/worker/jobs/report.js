import ms from 'ms'

import cloudWatch from 'services/cloud-watch'
import da from 'services/da'
import elasticSearch from 'services/elastic-search'
import reportMapping from 'server/mapping/report'

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
    const { identifier: projectIdentifier } = await da.getProject(projectID)

    if (datapoints.length) {
      await datapoints.reduce(
        async (previousJob, datapoint) => {
          await previousJob

          const { timestamp, value } = datapoint

          try {
            await elasticSearch.initMapping(
              projectIdentifier,
              metricName,
              reportMapping
            )

            return await elasticSearch.createOrUpdate(
              projectIdentifier,
              metricName,
              timestamp,
              datapoint
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
      when: when + ms('1h'),
      payload: {
        distributionIdentifier,
        name: metricName,
        period,
        startTime: startTime,
        endTime: Date.now() + ms('1h')
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export default {
  updateReport
}
