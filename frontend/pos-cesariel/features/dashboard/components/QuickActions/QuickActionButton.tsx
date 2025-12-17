import React from "react";
import type { QuickAction } from "../../types/dashboard.types";

interface QuickActionButtonProps {
  action: QuickAction;
}

export function QuickActionButton({ action }: QuickActionButtonProps) {
  const { title, description, href, color, icon } = action;

  return (
    <a
      href={href}
      className={`relative group ${color} p-4 rounded-lg text-white transition-colors duration-200`}
    >
      <div className="flex items-start space-x-3">
        {icon && (
          <div className="flex-shrink-0">
            {React.createElement(icon, {
              className: "h-5 w-5 text-white opacity-75",
            })}
          </div>
        )}
        <div className="flex-1">
          <h4 className="text-lg font-medium">{title}</h4>
          <p className="mt-1 text-sm opacity-90">{description}</p>
        </div>
      </div>
    </a>
  );
}
