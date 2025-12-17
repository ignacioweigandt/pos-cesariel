import type { StatCard } from "../../types/dashboard.types";

interface StatsCardProps {
  stat: StatCard;
}

export function StatsCard({ stat }: StatsCardProps) {
  return (
    <div className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
      <dt>
        <div className={`absolute ${stat.color} rounded-md p-3`}>
          <stat.icon className="h-6 w-6 text-white" />
        </div>
        <p className="ml-16 text-sm font-medium text-gray-500 truncate">
          {stat.name}
        </p>
      </dt>
      <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
        <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
      </dd>
    </div>
  );
}
