import ms from 'ms'

import cloudWatch from 'infrastructure/cloud-watch'

const METRIC_NAME = {
  BYTES_DOWNLOADED: 'BytesDownloaded',
  REQUESTS: 'Requests'
}

const METRIC_LABEL = {
  BytesDownloaded: 'BYTES_DOWNLOADED',
  Requests: 'REQUESTS'
}

const STATISTICS_TYPE = {
  REQUESTS: [ 'Sum' ],
  BYTES_DOWNLOADED: [ 'Sum' ],
}

const formatResponseData = (responseData) => ({
  name: METRIC_LABEL[ responseData.Label ],
  datapoints: responseData.Datapoints.map(
    (datapoint) => ({
      timestamp: datapoint.Timestamp.getTime(),
      value: datapoint.Sum
    })
  )
})

const formatRequestParams = ({
  name,
  endTime,
  startTime,
  period,
  distributionIdentifier
}) => ({
  Namespace: 'AWS/CloudFront',
  MetricName: METRIC_NAME[ name ],
  StartTime: new Date(Number(startTime)).toISOString(),
  EndTime: new Date(Number(endTime)).toISOString(),
  Period: period,
  Dimensions: [
    {
      Name: 'DistributionId',
      Value: distributionIdentifier
    },
    {
      Name: 'Region',
      Value: 'Global'
    }
  ],
  Statistics: STATISTICS_TYPE[ name ]
})

const getMetric = async (params) => {
  const { startTime, endTime, period } = params
  const responseData = await cloudWatch.getMetricStatistics(
    formatRequestParams(params)
  ).promise()

  return formatResponseData(responseData)
}

export default {
  getMetric
}
