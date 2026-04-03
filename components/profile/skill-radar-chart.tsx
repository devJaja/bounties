"use client";

import { SkillLevel } from "@/types/reputation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";

interface SkillRadarChartProps {
  skills: SkillLevel[];
  className?: string;
}

interface ChartData {
  skill: string;
  level: number;
  fullMark: number;
}

export function SkillRadarChart({ skills, className }: SkillRadarChartProps) {
  // Normalize skills to 0-100 scale and prepare chart data
  const chartData: ChartData[] = skills.map((skill) => ({
    skill: skill.name,
    level: Math.min(Math.max(skill.level, 0), 100),
    fullMark: 100,
  }));

  // Handle empty skills gracefully
  if (skills.length === 0) {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
          <CardTitle className="text-lg font-semibold">
            Technical Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>No skills data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxLevel = Math.max(...skills.map((s) => s.level), 100);
  const tickCount = maxLevel >= 100 ? 5 : Math.ceil(maxLevel / 20);

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
        <CardTitle className="text-lg font-semibold">
          Technical Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="hsl(var(--muted-foreground) / 0.3)" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, Math.ceil(maxLevel / 10) * 10]}
                tickCount={tickCount}
                tick={{
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 10,
                }}
                axisLine={false}
                tickLine={false}
              />
              <Radar
                name="Skill Level"
                dataKey="level"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.5)"
                fillOpacity={0.6}
                strokeWidth={2}
                dot={{
                  fill: "hsl(var(--primary))",
                  fillOpacity: 1,
                  r: 4,
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartData;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <p className="text-sm font-medium">{data.skill}</p>
                        <p className="text-xs text-muted-foreground">
                          Level: {data.level}/100
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
