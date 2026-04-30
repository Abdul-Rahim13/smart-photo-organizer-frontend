import Sidebar from '../../components/SideBar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#0f0a19] text-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
}