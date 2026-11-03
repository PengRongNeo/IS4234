"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader } from "../ui/Card";

const axis = { fontSize: 11, fill: "#64748b" };
const grid = "#e2e8f0";
const tooltipStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  fontSize: 12,
};

export function LineChartCard({
  title,
  subtitle,
  data,
  series,
}: {
  title: string;
  subtitle?: string;
  data: Record<string, string | number>[];
  series: { key: string; name: string; color: string }[];
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardBody className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={axis} />
            <YAxis tick={axis} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

export function BarChartCard({
  title,
  subtitle,
  data,
  dataKey,
}: {
  title: string;
  subtitle?: string;
  data: { name: string; score: number; fill: string }[];
  dataKey?: string;
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardBody className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={axis} interval={0} angle={-25} textAnchor="end" height={50} />
            <YAxis tick={axis} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey={dataKey ?? "score"} name="Risk score" radius={[3, 3, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

export function DualLineCard({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle?: string;
  data: Record<string, string | number>[];
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardBody className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={axis} />
            <YAxis yAxisId="left" tick={axis} />
            <YAxis yAxisId="right" orientation="right" tick={axis} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="terminations" name="Terminations" stroke="#334155" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="unfundedRate" name="Unfunded account %" stroke="#64748b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

export function DistributionPie({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number; fill: string }[];
}) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardBody className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
