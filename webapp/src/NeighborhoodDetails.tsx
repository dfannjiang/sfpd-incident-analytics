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
import { NeighborhoodDataResp, IncidentFilterProps } from "./types";

interface BarChartData {
  name: string;
  value: number;
}

interface LineChartData {
  name: string;
  value: number;
}

const NeighborhoodDetails: React.FC<{
  neighborhoodData: NeighborhoodDataResp;
  incidentFilters: IncidentFilterProps;
}> = ({ neighborhoodData, incidentFilters }) => {
  const [topIncidents, setTopIncidents] = useState<string[]>([]);
  const [incCatCounts, setIncCatCounts] = useState<BarChartData[]>([]);
  const [percentByHour, setPercentByHour] = useState<LineChartData[]>([]);
  const [countsByDay, setCountsByDay] = useState<LineChartData[]>([]);
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
    let incCatCounts: BarChartData[] = [];
    let otherCount = totalIncidents;
    for (var incidentCount of sortedIncidentCounts) {
      if ((totalIncidents - otherCount) / totalIncidents >= 0.8) {
        break;
      }
      const percentCount = (incidentCount.count * 100) / totalIncidents;
      incCatCounts.push({
        name: incidentCount.name,
        value: Math.round(percentCount * 100) / 100,
      });
      otherCount = otherCount - incidentCount.count;
    }
    setIncCatCounts(incCatCounts);

    let percentByHour: LineChartData[] = [];
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
      percentByHour.push({
        name: String(i),
        value: Math.round(percentCount * 100) / 100,
      });
    }
    setPercentByHour(percentByHour);
    setMedianPerDay(neighborhoodData.medianPerDay);

    const countsByDay: LineChartData[] = neighborhoodData.countsByDay.map(
      (incCount) => {
        return { name: incCount.day, value: incCount.count };
      }
    );
    setCountsByDay(countsByDay);
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
  const formatPercentLabel = (value: number) => {
    return String(value) + "%";
  };

  const formatDateLabel = (value: string) => {
    const date = new Date(value);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  const IncidentsByDayTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dateLabel = formatDateLabel(payload[0].payload.name);
      return (
        <div className="custom-tooltip">
          <p className="label">{`${dateLabel}: ${payload[0].payload.value}`}</p>
        </div>
      );
    }
    return null;
  };
  const incidentsByDayTitle = (timePeriod: string) => {
    switch (timePeriod) {
      case "1YEAR":
        return "Daily incidents: past year";
      case "3MONTH":
        return "Daily incidents: past 3 months";
      case "1MONTH":
        return "Daily incidents: past months";
      case "1WEEK":
        return "Daily incidents: past week";
      default:
        console.log(`Got invalid time period: ${timePeriod}`);
    }
  };

  return (
    <div>
      <h4>Median incidents per day: </h4>
      <p>{medianPerDay}</p>
      <h4>Top 80% of incidents</h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={incCatCounts}
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

      <h4>{incidentsByDayTitle(incidentFilters.timePeriod)}</h4>
      <ResponsiveContainer width="106%" height={250}>
        <LineChart
          width={100}
          height={300}
          data={countsByDay}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 10,
          }}
        >
          <Tooltip content={<IncidentsByDayTooltip />} />
          <XAxis
            dataKey="name"
            angle={-45}
            tickFormatter={formatDateLabel}
            dy={10}
          />
          <YAxis width={35} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            activeDot={{ r: 5 }}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <h4>Incidents by hour of day</h4>
      <ResponsiveContainer width="106%" height={250}>
        <LineChart
          width={100}
          height={300}
          data={percentByHour}
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
          <YAxis width={35} tickFormatter={formatPercentLabel} />
          <Tooltip content={<IncidentsByHourTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            activeDot={{ r: 5 }}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NeighborhoodDetails;
