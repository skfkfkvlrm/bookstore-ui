interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
  iconColor?: string;
}

const StatCard = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  bgColor = "bg-white dark:bg-[#1a2632]",
  iconColor = "text-[#1173d4]",
}: StatCardProps) => {
  return (
    <div
      className={`${bgColor} rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`material-symbols-outlined text-sm ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "trending_up" : "trending_down"}
              </span>
              <span
                className={`text-sm font-medium ${
                  trend.isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {trend.value}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-lg bg-gray-50 dark:bg-white/5 ${iconColor}`}
        >
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
