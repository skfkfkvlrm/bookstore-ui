import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Member } from "../../types";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import SearchInput from "../../components/common/SearchInput";
import FilterButton from "../../components/common/FilterButton";

// Mock data
const mockMembers: Member[] = [
  {
    id: 1,
    name: "Sophia Clark",
    email: "sophia.clark@email.com",
    membershipType: "PREMIUM",
    joinDate: "2023-01-15T10:30:00",
  },
  {
    id: 2,
    name: "Ethan Bennett",
    email: "ethan.bennett@email.com",
    membershipType: "REGULAR",
    joinDate: "2023-02-20T11:00:00",
  },
  {
    id: 3,
    name: "Olivia Carter",
    email: "olivia.carter@email.com",
    membershipType: "PREMIUM",
    joinDate: "2023-03-10T14:20:00",
  },
];

const MemberList = () => {
  const navigate = useNavigate();
  const [members] = useState<Member[]>(mockMembers);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map((member) => member.id));
    }
  };

  const handleSelectMember = (memberId: number) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} on members:`, selectedMembers);
    alert(`${action} on ${selectedMembers.length} selected member(s)`);
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedMembers.length === members.length && members.length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-[#1173d4] focus:ring-[#1173d4]"
        />
      ),
      accessor: (row: Member) => (
        <input
          type="checkbox"
          checked={selectedMembers.includes(row.id)}
          onChange={(e) => {
            e.stopPropagation();
            handleSelectMember(row.id);
          }}
          className="rounded border-gray-300 text-[#1173d4] focus:ring-[#1173d4]"
        />
      ),
    },
    {
      header: "Name",
      accessor: (row: Member) => (
        <button
          onClick={() => navigate(`/members/${row.id}`)}
          className="font-medium text-[#1173d4] hover:underline text-left"
        >
          {row.name}
        </button>
      ),
    },
    {
      header: "Email",
      accessor: "email" as keyof Member,
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
    {
      header: "Membership Type",
      accessor: (row: Member) => (
        <Badge variant={row.membershipType === "PREMIUM" ? "premium" : "standard"}>
          {row.membershipType}
        </Badge>
      ),
    },
    {
      header: "Join Date",
      accessor: (row: Member) => new Date(row.joinDate).toLocaleDateString(),
      className: "text-gray-600 dark:text-gray-400 cursor-pointer",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Members</h2>
        <Button onClick={() => navigate("/members/add")}>
          <span className="material-symbols-outlined">add</span>
          Add Member
        </Button>
      </div>

      {selectedMembers.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedMembers.length} member(s) selected
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleBulkAction("Export")}>
                <span className="material-symbols-outlined">download</span>
                Export
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleBulkAction("Delete")}>
                <span className="material-symbols-outlined">delete</span>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#1a2632] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <SearchInput placeholder="Search members by name or email" />
          </div>
          <div className="md:col-span-2 flex items-center gap-4 justify-end">
            <FilterButton label="Membership Type" />
            <FilterButton label="Join Date" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-white/5 text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            <tr>
              {columns.map((col, index) => (
                <th key={index} scope="col" className="px-6 py-3">
                  {typeof col.header === "function" ? col.header : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => (
              <tr
                key={member.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    !target.closest('input[type="checkbox"]') &&
                    !target.closest("button")
                  ) {
                    navigate(`/members/${member.id}`);
                  }
                }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 ${col.className || ""}`}>
                    {typeof col.accessor === "function"
                      ? col.accessor(member)
                      : member[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberList;
