"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Bar, BarChart, Pie, PieChart, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Datos de muestra - reemplazar con datos reales de tu backend
const monthlyOrdersData = [
    { month: 'Ene', orders: 65 },
    { month: 'Feb', orders: 59 },
    { month: 'Mar', orders: 80 },
    { month: 'Abr', orders: 81 },
    { month: 'May', orders: 56 },
    { month: 'Jun', orders: 55 },
    { month: 'Jul', orders: 40 },
]

const monthlyRevenueData = [
    { month: 'Ene', revenue: 4000, expenses: 3000 },
    { month: 'Feb', revenue: 3000, expenses: 2800 },
    { month: 'Mar', revenue: 5000, expenses: 4000 },
    { month: 'Abr', revenue: 4800, expenses: 3800 },
    { month: 'May', revenue: 3800, expenses: 3200 },
    { month: 'Jun', revenue: 3500, expenses: 3000 },
    { month: 'Jul', revenue: 2500, expenses: 2200 },
]

const salesByCategoryData = [
    { name: 'Pasteles', value: 400 },
    { name: 'Panes', value: 300 },
    { name: 'Galletas', value: 200 },
    { name: 'Bebidas', value: 100 },
]

const averageTicketData = [
    { month: 'Ene', avgTicket: 25 },
    { month: 'Feb', avgTicket: 27 },
    { month: 'Mar', avgTicket: 29 },
    { month: 'Abr', avgTicket: 28 },
    { month: 'May', avgTicket: 30 },
    { month: 'Jun', avgTicket: 31 },
    { month: 'Jul', avgTicket: 32 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function FinancesTab() {
    const [activeChart, setActiveChart] = useState('orders')
    console.log(activeChart);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Finanzas</CardTitle>
                <CardDescription>Resumen financiero detallado</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="orders" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="orders" onClick={() => setActiveChart('orders')}>Pedidos</TabsTrigger>
                        <TabsTrigger value="revenue" onClick={() => setActiveChart('revenue')}>Ingresos y Gastos</TabsTrigger>
                        <TabsTrigger value="categories" onClick={() => setActiveChart('categories')}>Categorías</TabsTrigger>
                        <TabsTrigger value="avgTicket" onClick={() => setActiveChart('avgTicket')}>Ticket Promedio</TabsTrigger>
                    </TabsList>
                    <TabsContent value="orders">
                        <ChartContainer
                            config={{
                                orders: {
                                    label: "Pedidos",
                                    color: "hsl(var(--chart-1))",
                                },
                            }}
                            className="h-[400px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyOrdersData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="orders" stroke="var(--color-orders)" name="Pedidos" />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </TabsContent>
                    <TabsContent value="revenue">
                        <ChartContainer
                            config={{
                                revenue: {
                                    label: "Ingresos",
                                    color: "hsl(var(--chart-2))",
                                },
                                expenses: {
                                    label: "Gastos",
                                    color: "hsl(var(--chart-3))",
                                },
                            }}
                            className="h-[400px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyRevenueData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="var(--color-revenue)" name="Ingresos" />
                                    <Bar dataKey="expenses" fill="var(--color-expenses)" name="Gastos" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </TabsContent>
                    <TabsContent value="categories">
                        <ChartContainer
                            config={{
                                value: {
                                    label: "Ventas",
                                    color: "hsl(var(--chart-4))",
                                },
                            }}
                            className="h-[400px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={salesByCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={150}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {salesByCategoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </TabsContent>
                    <TabsContent value="avgTicket">
                        <ChartContainer
                            config={{
                                avgTicket: {
                                    label: "Ticket Promedio",
                                    color: "hsl(var(--chart-5))",
                                },
                            }}
                            className="h-[400px]"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={averageTicketData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="avgTicket" stroke="var(--color-avgTicket)" name="Ticket Promedio" />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

