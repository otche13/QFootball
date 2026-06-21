import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface MobileShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function MobileShell({ children, hideNav = false }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-gray-200 flex items-start justify-center">
      <div className="relative w-[393px] min-h-screen bg-white overflow-x-hidden">
        {children}
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
