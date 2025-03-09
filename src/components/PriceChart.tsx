import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import usePriceStore from '../services/priceService';
import { format } from 'date-fns';

const PriceChart: React.FC = () => {
  const { priceData, isLoading, error, fetchPrice, fetchHistoricalData } = usePriceStore();

  useEffect(() => {
    fetchPrice();
    fetchHistoricalData(7); // Fetch 7 days of historical data
    const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatXAxis = (timestamp: number) => {
    return format(timestamp, 'MMM d, HH:mm');
  };

  const formatYAxis = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SOL Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="24h">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="1h">1H</TabsTrigger>
            <TabsTrigger value="24h">24H</TabsTrigger>
            <TabsTrigger value="7d">7D</TabsTrigger>
            <TabsTrigger value="30d">30D</TabsTrigger>
          </TabsList>
          
          <TabsContent value="1h" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData.slice(-60)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  labelFormatter={(timestamp) => format(timestamp, 'MMM d, yyyy HH:mm:ss')}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="24h" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData.slice(-1440)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  labelFormatter={(timestamp) => format(timestamp, 'MMM d, yyyy HH:mm:ss')}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="7d" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData.slice(-10080)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  labelFormatter={(timestamp) => format(timestamp, 'MMM d, yyyy HH:mm:ss')}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="30d" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData.slice(-43200)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  labelFormatter={(timestamp) => format(timestamp, 'MMM d, yyyy HH:mm:ss')}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PriceChart; 