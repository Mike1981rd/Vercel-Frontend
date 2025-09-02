'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import WhatsAppNav from '../components/WhatsAppNav';
import { ArrowLeft, TrendingUp, TrendingDown, Users, MessageSquare, Clock, Calendar, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// Datos de ejemplo para los gráficos
const monthlyData = [
  { month: 'Ene', mensajes: 1200, conversaciones: 89, respuestas: 1050 },
  { month: 'Feb', mensajes: 1900, conversaciones: 125, respuestas: 1700 },
  { month: 'Mar', mensajes: 2400, conversaciones: 156, respuestas: 2100 },
  { month: 'Abr', mensajes: 2100, conversaciones: 142, respuestas: 1900 },
  { month: 'May', mensajes: 2800, conversaciones: 189, respuestas: 2500 },
  { month: 'Jun', mensajes: 3200, conversaciones: 210, respuestas: 2900 }
];

const hourlyData = [
  { hour: '00:00', mensajes: 12 },
  { hour: '04:00', mensajes: 8 },
  { hour: '08:00', mensajes: 45 },
  { hour: '12:00', mensajes: 89 },
  { hour: '16:00', mensajes: 76 },
  { hour: '20:00', mensajes: 54 }
];

const categoryData = [
  { name: 'Consultas', value: 45, color: '#22c55e' },
  { name: 'Reservas', value: 30, color: '#3b82f6' },
  { name: 'Soporte', value: 15, color: '#f59e0b' },
  { name: 'Otros', value: 10, color: '#8b5cf6' }
];

const responseTimeData = [
  { range: '<1 min', count: 450, percentage: 45 },
  { range: '1-5 min', count: 300, percentage: 30 },
  { range: '5-15 min', count: 150, percentage: 15 },
  { range: '15-30 min', count: 70, percentage: 7 },
  { range: '>30 min', count: 30, percentage: 3 }
];

export default function WhatsAppAnalyticsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  
  // Stats cards data
  const stats = {
    totalMessages: { value: 12847, change: 12.5, trend: 'up' },
    activeConversations: { value: 321, change: -3.2, trend: 'down' },
    avgResponseTime: { value: '2.3 min', change: -15.0, trend: 'up' },
    satisfactionRate: { value: '94.5%', change: 2.1, trend: 'up' }
  };

  const exportData = () => {
    // Simulación de exportación de datos
    const dataStr = JSON.stringify({ monthlyData, categoryData, responseTimeData }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `whatsapp-analytics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Elegant minimal header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/whatsapp/chat')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
              aria-label="Volver al chat"
            >
              <ArrowLeft className="h-6 w-6 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
            </button>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Analytics WhatsApp
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Analiza el rendimiento y métricas de tus conversaciones
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Estadísticas en vivo</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 pt-4">
        <WhatsAppNav />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar datos
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mensajes</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages.value.toLocaleString()}</div>
              <p className={`text-xs flex items-center ${stats.totalMessages.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalMessages.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(stats.totalMessages.change)}% vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversaciones Activas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeConversations.value}</div>
              <p className={`text-xs flex items-center ${stats.activeConversations.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stats.activeConversations.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(stats.activeConversations.change)}% vs mes anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tiempo Respuesta Promedio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResponseTime.value}</div>
              <p className={`text-xs flex items-center text-green-600`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {Math.abs(stats.avgResponseTime.change)}% más rápido
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.satisfactionRate.value}</div>
              <p className={`text-xs flex items-center text-green-600`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {Math.abs(stats.satisfactionRate.change)}% vs mes anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vista General</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="response">Tiempos de Respuesta</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tendencia de Mensajes</CardTitle>
                  <CardDescription>Mensajes enviados y recibidos por mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="mensajes" stackId="1" stroke="var(--primary-color)" fill="var(--primary-color)" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="respuestas" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Categoría</CardTitle>
                  <CardDescription>Tipos de consultas más frecuentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución Horaria de Mensajes</CardTitle>
                <CardDescription>Horarios con mayor actividad</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="mensajes" fill="var(--primary-color)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="response" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tiempos de Respuesta</CardTitle>
                <CardDescription>Distribución de tiempos de respuesta a mensajes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {responseTimeData.map((item) => (
                    <div key={item.range} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.range}</span>
                        <span className="font-medium">{item.count} mensajes ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Consultas</CardTitle>
                  <CardDescription>Temas más consultados este mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Disponibilidad de habitaciones', 'Precios y tarifas', 'Servicios incluidos', 'Ubicación y transporte', 'Cancelaciones'].map((topic, index) => (
                      <div key={topic} className="flex items-center justify-between">
                        <span className="text-sm">{index + 1}. {topic}</span>
                        <Badge variant="secondary">{Math.floor(Math.random() * 100 + 50)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plantillas Más Usadas</CardTitle>
                  <CardDescription>Respuestas predefinidas populares</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Bienvenida nuevo cliente', 'Confirmación de reserva', 'Info check-in', 'Servicios disponibles', 'Despedida'].map((template, index) => (
                      <div key={template} className="flex items-center justify-between">
                        <span className="text-sm">{index + 1}. {template}</span>
                        <Badge variant="secondary">{Math.floor(Math.random() * 50 + 20)}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}