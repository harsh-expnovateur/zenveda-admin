import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Card = ({ title, value, change }) => {
  const isPositive = parseFloat(change) >= 0;
  
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-gray-500 text-sm mb-2">{title}</p>
      <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
      {change && (
        <p className={`text-sm mt-2 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(parseFloat(change))}% vs last month
        </p>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    salesChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    pendingCount: 0,
    cancelledCount: 0,
    pendingCancelledChange: 0,
  });
  const [monthlySalesData, setMonthlySalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get access token from localStorage
  const getAccessToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchMonthlySales(),
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/orders/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchMonthlySales = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/orders/dashboard/monthly-sales", {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMonthlySalesData(data.data.map(item => ({
          month: item.month,
          sales: parseFloat(item.total_sales),
        })));
      }
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatLargeNumber = (num) => {
    if (num >= 100000) {
      return `${(num / 100000).toFixed(1)}L`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card 
          title="Total Sales" 
          value={formatCurrency(stats.totalSales)}
          change={stats.salesChange}
        />
        <Card 
          title="Total Orders" 
          value={formatLargeNumber(stats.totalOrders)}
          change={stats.ordersChange}
        />
        <Card 
          title="Pending & Cancelled" 
          value={`${stats.pendingCount} / ${stats.cancelledCount}`}
          change={stats.pendingCancelledChange}
        />
      </div>

      {/* Monthly Sales Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-6">Monthly Sales Overview</h3>
        {monthlySalesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#666' }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fill: '#666' }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `₹${formatLargeNumber(value)}`}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Sales']}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Bar 
                dataKey="sales" 
                fill="#16a34a" 
                radius={[8, 8, 0, 0]}
                name="Sales Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-500">
            No sales data available
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;