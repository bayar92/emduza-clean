import AdminNavBar from "@/components/AdminNavbar";
import AdminLoadingProvider from "@/components/AdminLoadingProvider";

export default function DuzAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminNavBar />
      <div className="flex-1 ml-64">
        <AdminLoadingProvider>{children}</AdminLoadingProvider>
      </div>
    </div>
  );
}
