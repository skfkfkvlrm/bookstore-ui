import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import MemberList from "./pages/members/MemberList";
import MemberAdd from "./pages/members/MemberAdd";
import MemberDetail from "./pages/members/MemberDetail";

// 임시 플레이스홀더 컴포넌트
const Placeholder = ({ title }: { title: string }) => (
  <div className="max-w-7xl mx-auto">
    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{title}</h1>
    <p className="mt-4 text-gray-600 dark:text-gray-400">이 페이지는 현재 개발 중입니다.</p>
  </div>
);

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/members" element={<MemberList />} />
        <Route path="/members/add" element={<MemberAdd />} />
        <Route path="/members/:id" element={<MemberDetail />} />
        <Route path="/books" element={<Placeholder title="Books" />} />
        <Route path="/orders" element={<Placeholder title="Orders" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
      </Routes>
    </Layout>
  );
}

export default App;
