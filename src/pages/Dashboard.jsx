import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
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
import PermissionGuard from "../components/PermissionGuard";

const Card = ({ title, value, change }) => {
  const isPositive = parseFloat(change) >= 0;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-gray-500 text-sm mb-2">{title}</p>
      <h2 className="text-3xl font-bold text-gray-800">{value}</h2>
      {change && (
        <p
          className={`text-sm mt-2 ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositive ? "▲" : "▼"} {Math.abs(parseFloat(change))}% vs last month
        </p>
      )}
    </div>
  );
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

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

  const getCurrentFinancialYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 = Jan

    return month >= 3
      ? `${year}-${(year + 1).toString().slice(-2)}`
      : `${year - 1}-${year.toString().slice(-2)}`;
  };

  const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYear());

  // Generate financial year options dynamically
  const getFinancialYearOptions = () => {
    const options = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0 = Jan

    // Determine current FY
    const currentFYStart = currentMonth >= 3 ? currentYear : currentYear - 1;

    // Generate FY options: go back 5 years from current FY
    for (let i = 0; i <= 5; i++) {
      const fyStartYear = currentFYStart - i;
      const fyEndYear = fyStartYear + 1;
      const fy = `${fyStartYear}-${fyEndYear.toString().slice(-2)}`;
      options.push(fy);
    }

    return options;
  };

  const getFYMonths = () => [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchMonthlySales()]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axiosInstance.get("/admin/orders/dashboard/stats");

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchMonthlySales = async () => {
    try {
      const { data } = await axiosInstance.get(
        "/admin/orders/dashboard/monthly-sales",
        {
          params: { fy: selectedFY },
        }
      );

      if (data.success) {
        const months = getFYMonths();

        // Initialize all months with 0
        const salesMap = {
          Apr: 0,
          May: 0,
          Jun: 0,
          Jul: 0,
          Aug: 0,
          Sep: 0,
          Oct: 0,
          Nov: 0,
          Dec: 0,
          Jan: 0,
          Feb: 0,
          Mar: 0,
        };

        const [fyStartYear, fyEndShort] = selectedFY.split("-");
        const fyEndYear = Number(`20${fyEndShort}`);

        data.data.forEach((item) => {
          const monthIndex = item.month_num - 1;
          const monthName = MONTHS[monthIndex];

          // Apr-Dec → FY start year
          // Jan-Mar → FY end year
          const expectedYear =
            item.month_num >= 4 ? Number(fyStartYear) : fyEndYear;

          if (
            item.year === expectedYear &&
            salesMap.hasOwnProperty(monthName)
          ) {
            salesMap[monthName] = Number(item.total_sales);
          }
        });

        // Create formatted data array with all months (0 for missing data)
        const formattedData = months.map((m) => ({
          month: m,
          sales: salesMap[m],
        }));

        setMonthlySalesData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching monthly sales:", error);
      // On error, show all months with 0 sales
      const months = getFYMonths();
      const emptyData = months.map((m) => ({
        month: m,
        sales: 0,
      }));
      setMonthlySalesData(emptyData);
    }
  };

  useEffect(() => {
    fetchMonthlySales();
  }, [selectedFY]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
    <PermissionGuard permission="dashboard">
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
          {/* Header + FY Dropdown */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Monthly Sales Overview</h3>

            <select
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {getFinancialYearOptions().map((fy) => (
                <option key={fy} value={fy}>
                  FY {fy}
                </option>
              ))}
            </select>
          </div>

          {monthlySalesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#666" }}
                  axisLine={{ stroke: "#e0e0e0" }}
                />
                <YAxis
                  tick={{ fill: "#666" }}
                  axisLine={{ stroke: "#e0e0e0" }}
                  tickFormatter={(value) => `₹${formatLargeNumber(value)}`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Sales"]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="sales"
                  fill="#16a34a"
                  radius={[8, 8, 0, 0]}
                  name="Sales Amount"
                  barSize={30}
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
    </PermissionGuard>
  );
};

export default Dashboard;
