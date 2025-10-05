import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Member } from "../../types";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import SearchInput from "../../components/common/SearchInput";
import FilterButton from "../../components/common/FilterButton";
import Table from "../../components/common/Table";

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

  const columns = [
    {
      header: "Name",
      accessor: "name" as keyof Member,
      className: "font-medium text-gray-900 dark:text-white",
    },
    {
      header: "Email",
      accessor: "email" as keyof Member,
      className: "text-gray-600 dark:text-gray-400",
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
      className: "text-gray-600 dark:text-gray-400",
    },
    {
      header: "Actions",
      accessor: (row: Member) => (
        <button
          onClick={() => navigate(`/members/${row.id}`)}
          className="text-[#1173d4] font-medium hover:underline"
        >
          View Details
        </button>
      ),
      className: "text-right",
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

      <Table data={members} columns={columns} />
    </div>
  );
};

export default MemberList;
