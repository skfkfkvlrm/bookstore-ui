import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-[#101922]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-scroll">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
