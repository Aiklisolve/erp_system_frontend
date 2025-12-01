import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';

type RootLayoutProps = {
  children?: React.ReactNode;
};

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f8f9fc] text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-4 md:py-6 space-y-4 animate-fade-in">
            <Breadcrumbs />
            {children ?? <Outlet />}
          </div>
        </div>
      </div>
    </div>
  );
}


