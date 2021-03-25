import { InfluxDB } from '@influxdata/influxdb-client';

require('dotenv').config();

const token = process.env.INFLUXDB_TOKEN;

const client = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token,
});

const queryApi = client.getQueryApi(process.env.INFLUXDB_ORG);

const writePoints = async (points) => {
  const writeApi = client.getWriteApi(
    process.env.INFLUXDB_ORG,
    process.env.INFLUXDB_BUCKET,
    's'
  );
  writeApi.writePoints(points);
  await writeApi.close();
};

const getJobWaitTimes = async (startTime) => {
  const unixTimestamp = startTime.getTime() / 1000;
  const fluxQuery = `from(bucket: "${process.env.INFLUXDB_BUCKET}")
  |> range(start: ${unixTimestamp}, stop: ${unixTimestamp + 1})
  |> filter(fn: (r) => r["_measurement"] == "waittime")
  |> filter(fn: (r) => r["_field"] == "amount")
  |> sort(columns: ["rideId"], desc: true)`;

  const data = await queryApi.collectRows(fluxQuery);
  return data || null;
};

const getParkRideWaitTimes = async (parkId) => {
  const fluxQuery = `from(bucket: "${process.env.INFLUXDB_BUCKET}")
  |> range(start: 0, stop: now())
  |> filter(fn: (r) => r["_measurement"] == "waittime")
  |> filter(fn: (r) => r["_field"] == "amount")
  |> filter(fn: (r) => r["parkId"] == "${parkId}")
  |> sort(columns: ["_time"], desc: false)
  |> last(column: "_time")`;

  const data = await queryApi.collectRows(fluxQuery);
  return data || null;
};

const getRideWaitTime = async (rideId) => {
  const fluxQuery = `from(bucket: "${process.env.INFLUXDB_BUCKET}")
  |> range(start: 0, stop: now())
  |> filter(fn: (r) => r["_measurement"] == "waittime")
  |> filter(fn: (r) => r["_field"] == "amount")
  |> filter(fn: (r) => r["rideId"] == "${rideId}")
  |> sort(columns: ["_time"], desc: false)
  |> last(column: "_time")`;

  const data = await queryApi.collectRows(fluxQuery);
  return (data && data[0]) || null;
};

const getRideWaitTimes = async (rideId) => {
  const fluxQuery = `from(bucket: "${process.env.INFLUXDB_BUCKET}")
  |> range(start: -7d, stop: now())
  |> filter(fn: (r) => r["_measurement"] == "waittime")
  |> filter(fn: (r) => r["_field"] == "amount")
  |> filter(fn: (r) => r["rideId"] == "${rideId}")
  |> sort(columns: ["_time"], desc: true)`;

  const data = await queryApi.collectRows(fluxQuery);
  return data || null;
};

export default client;
export {
  writePoints,
  getJobWaitTimes,
  getParkRideWaitTimes,
  getRideWaitTime,
  getRideWaitTimes,
};
