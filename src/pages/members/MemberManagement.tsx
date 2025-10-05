
import type { Member } from "../../types";
import { Plus, MoreVertical } from "lucide-react";

// API 가이드 기반의 목 데이터
const mockMembers: Member[] = [
  {
    id: 1,
    name: "홍길동",
    email: "hong@example.com",
    membershipType: "REGULAR",
    joinDate: "2025-01-15T10:30:00",
  },
  {
    id: 2,
    name: "김개발",
    email: "kim.dev@example.com",
    membershipType: "PREMIUM",
    joinDate: "2025-01-16T11:00:00",
  },
  {
    id: 3,
    name: "박스프링",
    email: "park.spring@example.com",
    membershipType: "REGULAR",
    joinDate: "2025-01-17T14:20:00",
  },
];

const MemberManagement = () => {
  // TODO: API 연동 (axios 사용)
  const members = mockMembers;

  return (
    
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">사용자 관리</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center">
          <Plus className="mr-2 h-6 w-6" />
          <span>새 사용자 추가</span>
        </button>
      </header>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">이름</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">이메일</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">멤버십</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">가입일</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={member.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">{member.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{member.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      member.membershipType === "PREMIUM"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-green-200 text-green-800"
                    }`}>
                    {member.membershipType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {new Date(member.joinDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button className="text-gray-500 hover:text-gray-800">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberManagement;
