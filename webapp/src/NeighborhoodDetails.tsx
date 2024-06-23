import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { NeighborhoodDataResp } from "./types";

interface PieChartData {
  name: string;
  value: number;
}

interface LineChartData {
  name: string;
  value: number;
}

const NeighborhoodDetails: React.FC<NeighborhoodDataResp> = (
  neighborhoodData
) => {
  const [topIncidents, setTopIncidents] = useState<string[]>([]);
  const [barChartData, setBarChartData] = useState<PieChartData[]>([]);
  const [lineChartData, setLineChartData] = useState<LineChartData[]>([]);
  const [medianPerDay, setMedianPerDay] = useState<number | null>(null);

  useEffect(() => {
    const sortedIncidentCounts = neighborhoodData.categoryCounts.sort(
      (a, b) => {
        return b.count - a.count;
      }
    );

    let topIncidents = [];
    for (let i = 0; i < Math.min(sortedIncidentCounts.length, 5); i++) {
      topIncidents.push(sortedIncidentCounts[i].name);
    }
    setTopIncidents(topIncidents);

    const totalIncidents = sortedIncidentCounts.reduce(
      (partialSum, x) => partialSum + x.count,
      0
    );
    let barChartData: PieChartData[] = [];
    let otherCount = totalIncidents;
    for (var incidentCount of sortedIncidentCounts) {
      if ((totalIncidents - otherCount) / totalIncidents >= 0.8) {
        break;
      }
      const percentCount = (incidentCount.count * 100) / totalIncidents;
      barChartData.push({
        name: incidentCount.name,
        value: Math.round(percentCount * 100) / 100,
      });
      otherCount = otherCount - incidentCount.count;
    }
    setBarChartData(barChartData);

    let lineChartData: LineChartData[] = [];
    const totalCountsByHour = neighborhoodData.countsByHour.reduce(
      (partialSum, x) => partialSum + x,
      0
    );
    for (let i = 0; i < 24; i++) {
      let count = 0;
      if (i < neighborhoodData.countsByHour.length) {
        count = neighborhoodData.countsByHour[i];
      }
      const percentCount = (count * 100) / totalCountsByHour;
      lineChartData.push({
        name: String(i),
        value: Math.round(percentCount * 100) / 100,
      });
    }
    setLineChartData(lineChartData);
    setMedianPerDay(neighborhoodData.medianPerDay);
  }, [neighborhoodData]);

  if (topIncidents.length == 0) {
    return <p>No incidents found</p>;
  }

  const TopIncidentsYTicks = ({ x, y, payload }: any) => {
    const truncatedLabel =
      payload.value.length > 15
        ? payload.value.slice(0, 15) + "..."
        : payload.value;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={-5}
          y={0}
          dy={5}
          textAnchor="end"
          fill="#666"
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            maxWidth: "100px",
          }}
        >
          {truncatedLabel}
        </text>
      </g>
    );
  };

  const TopIncidentsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${payload[0].payload.name}: ${payload[0].payload.value}%`}</p>
        </div>
      );
    }
    return null;
  };

  const IncidentsByHourTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const hour = parseInt(payload[0].payload.name);
      const hourLabel = `${hour % 12 == 0 ? "12" : hour % 12}${
        hour < 12 ? "AM" : "PM"
      }`;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${hourLabel}: ${payload[0].payload.value}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Depending on the value of the tick, you'll have a different label
  const formatLineChartYAxis = (value: number) => {
    return String(value) + "%";
  };

  return (
    <div>
      <h4>Median incidents per day: </h4>
      <p>{medianPerDay}</p>
      <h4>Top 80% of incidents</h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={barChartData}
          margin={{
            top: 20,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            label={{
              value: "% of Incidents",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={TopIncidentsYTicks}
            interval={0}
            width={150}
          />
          <Tooltip content={<TopIncidentsTooltip />} />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h4>Incidents by hour of day</h4>
      <ResponsiveContainer width="106%" height={250}>
        <LineChart
          width={100}
          height={300}
          data={lineChartData}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            label={{
              value: "Hour of the day",
              position: "insideBottom",
              offset: -5,
            }}
            interval={0}
          />
          <YAxis width={35} tickFormatter={formatLineChartYAxis} />
          <Tooltip content={<IncidentsByHourTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NeighborhoodDetails;
