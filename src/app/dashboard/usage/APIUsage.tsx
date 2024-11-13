//@ts-nocheck
"use client";
import React, {useEffect, useState} from "react";
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {ScaleLoader} from "react-spinners";

function APIUsage({ graphData, isLoading }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (graphData && !graphData.error) {
            console.log("Original Graph Data:", graphData);
            try {
                const dataArray = Object.entries(graphData.data.data.data).map(([key, value]) => ({
                    date: new Date(value.Day).toISOString(),
                    total: parseInt(value.Total) || 0
                }));

                const sortedData = dataArray.sort((a, b) => new Date(a.date) - new Date(b.date));

                console.log("Formatted Chart Data:", sortedData);
                setChartData(sortedData);
            } catch (error) {
                console.error("Error formatting data:", error);
                setChartData([]);
            }
        }
    }, [graphData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="text-sm text-muted-foreground mb-1">
                        {new Date(label).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        })}
                    </p>
                    <p className="text-sm font-medium">
                        Total: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    console.log("Current chartData:", chartData);

    return (
        <div className="rounded-lg border bg-card mt-[40px]">
            <div className="flex flex-col justify-center gap-1 px-6 py-5 border-b">
                <h3 className="text-lg font-semibold">API Usage</h3>
                <p className="text-sm text-muted-foreground">
                    API request count
                </p>
            </div>
            <div className="p-6">
                <div className="h-[300px] sm:h-[200px] md:h-[300px] lg:h-[600px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <ScaleLoader color="hsl(var(--primary))" />
                        </div>
                    ) : chartData && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 40,
                                    bottom: 5
                                }}
                            >
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="3 3"
                                    stroke="rgba(255,255,255,0.1)"
                                />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tick={{ fill: 'currentColor' }}
                                    tickFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric"
                                        });
                                    }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tick={{ fill: 'currentColor' }}
                                    // Format large numbers with K (thousands)
                                    tickFormatter={(value) => {
                                        if (value >= 1000) {
                                            return `${(value / 1000).toFixed(1)}K`;
                                        }
                                        return value;
                                    }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="total"
                                    fill="#FFA500"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">
                                No data available for the selected period
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default APIUsage;