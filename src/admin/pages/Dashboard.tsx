import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import StatCard from "../../shared/components/common/StatCard";
import Badge from "../../shared/components/common/Badge";
import DateRangePicker from "../../shared/components/common/DateRangePicker";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Mock data for statistics
const currentDate = new Date().toLocaleDateString("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const mockStats = {
  members: {
    total: 1234,
    todayNew: 5,
    premium: 456,
    regular: 778,
  },
  orders: {
    today: 23,
    week: 156,
    month: 678,
    monthRevenue: 12450000,
  },
  loans: {
    active: 89,
    overdue: 12,
    returned: 234,
    total: 335,
  },
  books: {
    total: 567,
    available: 478,
    onLoan: 89,
    todayRegistered: 3,
  },
};

const topSellingBooks = [
  {
    id: 1,
    title: "Clean Code",
    author: "Robert C. Martin",
    quantity: 50,
    revenue: 2250000,
  },
  {
    id: 2,
    title: "Spring in Action",
    author: "Craig Walls",
    quantity: 45,
    revenue: 2340000,
  },
  {
    id: 3,
    title: "Effective Java",
    author: "Joshua Bloch",
    quantity: 42,
    revenue: 2016000,
  },
  {
    id: 4,
    title: "Design Patterns",
    author: "Gang of Four",
    quantity: 38,
    revenue: 2090000,
  },
  {
    id: 5,
    title: "Head First Design Patterns",
    author: "Eric Freeman",
    quantity: 35,
    revenue: 1575000,
  },
];

// Generate mock daily data for the last 30 days
const generateDailyData = () => {
  const days = [];
  const salesData = [];
  const ordersData = [];
  const membersData = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" }));
    salesData.push(Math.floor(Math.random() * 500000) + 300000);
    ordersData.push(Math.floor(Math.random() * 30) + 15);
    membersData.push(Math.floor(Math.random() * 10) + 2);
  }

  return { days, salesData, ordersData, membersData };
};

const Dashboard = () => {
  const { days, salesData, ordersData, membersData } = generateDailyData();

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    // TODO: Fetch data based on new date range
    console.log("Date range changed:", newStartDate, "to", newEndDate);
  };

  // Sales Chart Data
  const salesChartData = {
    labels: days,
    datasets: [
      {
        label: "일별 매출",
        data: salesData,
        borderColor: "#2f9e5f",
        backgroundColor: "rgba(17, 115, 212, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Orders Chart Data
  const ordersChartData = {
    labels: days,
    datasets: [
      {
        label: "일별 주문 수",
        data: ordersData,
        backgroundColor: "#2f9e5f",
        borderRadius: 4,
      },
    ],
  };

  // Member Growth Chart Data
  const memberGrowthChartData = {
    labels: days,
    datasets: [
      {
        label: "일별 신규 회원",
        data: membersData,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Loan Status Doughnut Chart
  const loanStatusChartData = {
    labels: ["대여 중", "연체", "반납 완료"],
    datasets: [
      {
        data: [mockStats.loans.active, mockStats.loans.overdue, mockStats.loans.returned],
        backgroundColor: ["#2f9e5f", "#ef4444", "#10b981"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#9ca3af",
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#374151",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#9ca3af",
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
        ticks: {
          color: "#9ca3af",
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#9ca3af",
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            기준 일자: {currentDate}
          </p>
        </div>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        label="통계 기간 선택"
      />

      {/* Member Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          회원 통계
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="누적 회원 수"
            value={mockStats.members.total.toLocaleString()}
            icon="group"
            subtitle="전체 등록 회원"
            trend={{ value: 5.2, isPositive: true }}
          />
          <StatCard
            title="금일 가입 회원"
            value={mockStats.members.todayNew}
            icon="person_add"
            subtitle="오늘 신규 가입"
          />
          <StatCard
            title="프리미엄 회원"
            value={mockStats.members.premium.toLocaleString()}
            icon="workspace_premium"
            subtitle={`일반 ${mockStats.members.regular}명`}
            iconColor="text-yellow-600"
          />
          <StatCard
            title="회원 전환율"
            value="37%"
            icon="trending_up"
            subtitle="Premium 회원 비율"
            iconColor="text-green-600"
          />
        </div>
      </div>

      {/* Member Growth Chart */}
      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          회원 증가 추이
        </h3>
        <div style={{ height: "300px" }}>
          <Line data={memberGrowthChartData} options={chartOptions} />
        </div>
      </div>

      {/* Order Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          주문 통계
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="금일 주문 수"
            value={mockStats.orders.today}
            icon="receipt_long"
            subtitle="오늘 접수된 주문"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="금주 주문 수"
            value={mockStats.orders.week.toLocaleString()}
            icon="calendar_month"
            subtitle="이번 주 주문"
          />
          <StatCard
            title="금월 주문 수"
            value={mockStats.orders.month.toLocaleString()}
            icon="today"
            subtitle="이번 달 주문"
          />
          <StatCard
            title="금월 주문 금액"
            value={`₩${(mockStats.orders.monthRevenue / 10000).toLocaleString()}만`}
            icon="paid"
            subtitle={`평균 ₩${Math.round(mockStats.orders.monthRevenue / mockStats.orders.month).toLocaleString()}`}
            iconColor="text-green-600"
            trend={{ value: 8.3, isPositive: true }}
          />
        </div>
      </div>

      {/* Sales and Orders Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            일별 매출 추이
          </h3>
          <div style={{ height: "300px" }}>
            <Line data={salesChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            일별 주문 수
          </h3>
          <div style={{ height: "300px" }}>
            <Bar data={ordersChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Loan Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          대여 통계
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="활성 대여"
            value={mockStats.loans.active}
            icon="library_books"
            subtitle="현재 대여 중"
            iconColor="text-blue-600"
          />
          <StatCard
            title="연체 대여"
            value={mockStats.loans.overdue}
            icon="warning"
            subtitle="반납 기한 초과"
            iconColor="text-red-600"
            trend={{ value: 3.2, isPositive: false }}
          />
          <StatCard
            title="반납 완료"
            value={mockStats.loans.returned.toLocaleString()}
            icon="check_circle"
            subtitle="이번 달 반납"
            iconColor="text-green-600"
          />
          <StatCard
            title="전체 대여 건수"
            value={mockStats.loans.total.toLocaleString()}
            icon="auto_stories"
            subtitle="누적 대여 건수"
          />
        </div>
      </div>

      {/* Loan Status Chart */}
      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          대여 현황
        </h3>
        <div style={{ height: "300px" }} className="flex items-center justify-center">
          <div style={{ width: "300px", height: "300px" }}>
            <Doughnut data={loanStatusChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Book Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          도서 통계
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="전체 도서 수"
            value={mockStats.books.total.toLocaleString()}
            icon="menu_book"
            subtitle="등록된 도서"
          />
          <StatCard
            title="대여 가능 도서"
            value={mockStats.books.available.toLocaleString()}
            icon="book"
            subtitle="현재 대여 가능"
            iconColor="text-green-600"
          />
          <StatCard
            title="대여 중 도서"
            value={mockStats.books.onLoan}
            icon="book_online"
            subtitle="현재 대여 중"
            iconColor="text-orange-600"
          />
          <StatCard
            title="금일 등록 도서"
            value={mockStats.books.todayRegistered}
            icon="add_box"
            subtitle="오늘 새로 등록"
            trend={{ value: 15.0, isPositive: true }}
          />
        </div>
      </div>

      {/* Top Selling Books */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          베스트셀러 TOP 5
        </h2>
        <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-white/5 text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">순위</th>
                <th className="px-6 py-3 text-left">도서명</th>
                <th className="px-6 py-3 text-left">저자</th>
                <th className="px-6 py-3 text-center">판매 수량</th>
                <th className="px-6 py-3 text-right">매출액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topSellingBooks.map((book, index) => (
                <tr
                  key={book.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {index === 0 && (
                        <Badge variant="premium">
                          <span className="material-symbols-outlined text-sm">
                            trophy
                          </span>
                          1위
                        </Badge>
                      )}
                      {index === 1 && (
                        <Badge variant="confirmed">
                          <span className="material-symbols-outlined text-sm">
                            medal
                          </span>
                          2위
                        </Badge>
                      )}
                      {index === 2 && (
                        <Badge variant="shipped">
                          <span className="material-symbols-outlined text-sm">
                            medal
                          </span>
                          3위
                        </Badge>
                      )}
                      {index > 2 && (
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {index + 1}위
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {book.title}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {book.author}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {book.quantity}권
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                    ₩{book.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
