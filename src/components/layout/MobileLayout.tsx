import { NavLink, Outlet } from 'react-router-dom';
import { Home, PieChart, User } from 'lucide-react';

export default function MobileLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 pb-safe">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4" dir="rtl">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">ثبت هزینه</span>
          </NavLink>

          <NavLink
            to="/report"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <PieChart className="w-6 h-6" />
            <span className="text-[10px] font-medium">گزارش ماهانه</span>
          </NavLink>

          <NavLink
            to="/account"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">حساب کاربری</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}