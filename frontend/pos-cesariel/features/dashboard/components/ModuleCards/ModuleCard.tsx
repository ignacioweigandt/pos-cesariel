import { ArrowRightIcon } from "@heroicons/react/24/outline";
import type { ModuleCardData } from "../../types/dashboard.types";

interface ModuleCardProps {
  module: ModuleCardData;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const { title, description, icon: Icon, href, color, available } = module;

  const baseClasses =
    "relative group block p-6 rounded-lg transition-all duration-200 border-2";
  const availableClasses = available
    ? "border-transparent bg-white hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    : "border-dashed border-gray-300 bg-gray-50 cursor-not-allowed opacity-75";

  const content = (
    <div className="flex items-start space-x-4">
      <div
        className={`flex-shrink-0 ${
          available ? color : "bg-gray-400"
        } p-3 rounded-lg`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3
            className={`text-lg font-medium ${
              available ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {title}
          </h3>
          {!available && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Próximamente
            </span>
          )}
        </div>
        <p
          className={`mt-1 text-sm ${
            available ? "text-gray-600" : "text-gray-400"
          }`}
        >
          {description}
        </p>
        {available && (
          <div className="mt-3 flex items-center text-sm text-indigo-600 group-hover:text-indigo-500">
            <span>Acceder al módulo</span>
            <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </div>
    </div>
  );

  if (available) {
    return (
      <a href={href} className={`${baseClasses} ${availableClasses}`}>
        {content}
      </a>
    );
  }

  return <div className={`${baseClasses} ${availableClasses}`}>{content}</div>;
}
