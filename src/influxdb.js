import { InfluxDB } from '@influxdata/influxdb-client';

require('dotenv').config();

const token = process.env.INFLUXDB_TOKEN;

const client = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token,
  timeout: 10000,
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
  |> filter(fn: (r) => r["_field"] == "active" or r["_field"] == "amount" or r["_field"] == "status")
  |> sort(columns: ["rideId"], desc: true)
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;

  const data = await queryApi.collectRows(fluxQuery);
  return data || null;
};

const getParkRideWaitTimes = async (parkId) => {
  const fluxQuery = `from(bucket: "${process.env.INFLUXDB_BUCKET}")
  |> range(start: 0, stop: now())
  |> filter(fn: (r) => r["_measurement"] == "waittime")
  |> filter(fn: (r) => r["_field"] == "active" or r["_field"] == "amount" or r["_field"] == "status")
  |> filter(fn: (r) => r["parkId"] == "${parkId}")
  |> sort(columns: ["_time"], desc: false)
  |> last(column: "_time")
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;

  const data = await queryApi.collectRows(fluxQuery);
  return data || null;
};

const getRideWaitTime = async (rideId) => {
  const fluxQuery = `from(bucket: "${process.env.INFLUXDB_BUCKET}")
  |> range(start: 0, stop: now())
  |> filter(fn: (r) => r["_measurement"] == "waittime")
  |> filter(fn: (r) => r["_field"] == "active" or r["_field"] == "amount" or r["_field"] == "status")
  |> filter(fn: (r) => r["rideId"] == "${rideId}")
  |> last(column: "_time")
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;

  const data = await queryApi.collectRows(fluxQuery);
  return (data && data[0]) || null;
};

const getRideWaitTimes = async (rideId, startDate, endDate) => {
  const fluxQuery = `from(bucket: "${process.env.INFLUXDB_BUCKET}")
  |> range(start: ${startDate.toISOString()}, stop: ${endDate.toISOString()})
  |> filter(fn: (r) => r["_measurement"] == "waittime")
  |> filter(fn: (r) => r["_field"] == "active" or r["_field"] == "amount" or r["_field"] == "status")
  |> filter(fn: (r) => r["rideId"] == "${rideId}")
  |> sort(columns: ["_time"], desc: false)
  |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")`;
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
