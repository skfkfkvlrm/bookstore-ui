type BadgeVariant = 'premium' | 'standard' | 'available' | 'unavailable' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'active' | 'returned' | 'overdue' | 'suspended' | 'dormant' | 'withdrawn';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const Badge = ({ variant, children }: BadgeProps) => {
  const variantStyles = {
    premium: "bg-[#1173d4]/20 text-[#1173d4]",
    standard: "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    available: "bg-green-500/20 text-green-600 dark:text-green-400",
    unavailable: "bg-red-500/20 text-red-600 dark:text-red-400",
    pending: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    confirmed: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    shipped: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    delivered: "bg-green-500/20 text-green-600 dark:text-green-400",
    cancelled: "bg-red-500/20 text-red-600 dark:text-red-400",
    active: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    returned: "bg-green-500/20 text-green-600 dark:text-green-400",
    overdue: "bg-red-500/20 text-red-600 dark:text-red-400",
    suspended: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
    dormant: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
    withdrawn: "bg-red-700/20 text-red-700 dark:text-red-300",
  };

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${variantStyles[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;
