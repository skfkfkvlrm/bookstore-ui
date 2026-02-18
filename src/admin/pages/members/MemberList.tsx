import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Member } from "../../../shared/types";
import Button from "../../../shared/components/common/Button";
import Badge from "../../../shared/components/common/Badge";
import SearchInput from "../../../shared/components/common/SearchInput";

import Pagination from "../../../shared/components/common/Pagination";
import membersData from "../../../shared/data/members.json";

const ITEMS_PER_PAGE = 10;

// Additional mock members
const additionalMembers: Member[] = [
  {
    id: 3,
    name: "Olivia Carter",
    email: "olivia.carter@email.com",
    membershipType: "PREMIUM",
    status: "DORMANT",
    joinDate: "2023-03-10T14:20:00",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "james.wilson@email.com",
    membershipType: "REGULAR",
    status: "SUSPENDED",
    joinDate: "2023-04-05T09:15:00",
  },
  {
    id: 5,
    name: "Emma Davis",
    email: "emma.davis@email.com",
    membershipType: "PREMIUM",
    status: "WITHDRAWN",
    joinDate: "2023-05-12T13:45:00",
  },
];

// Combine shared data with additional mock members
const mockMembers: Member[] = [...(membersData as Member[]), ...additionalMembers];

const MemberList = () => {
  const navigate = useNavigate();
  const [members] = useState<Member[]>(mockMembers);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "email" | "joinDate">("joinDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | "ACTIVE" | "SUSPENDED" | "DORMANT" | "WITHDRAWN">("all");
  const [membershipFilter, setMembershipFilter] = useState<"all" | "REGULAR" | "PREMIUM">("all");

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch = searchQuery === "" ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesMembership = membershipFilter === "all" || member.membershipType === membershipFilter;

    return matchesSearch && matchesStatus && matchesMembership;
  });

  // Sort members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "email":
        comparison = a.email.localeCompare(b.email);
        break;
      case "joinDate":
        comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = sortedMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSelectAll = () => {
    if (selectedMembers.length === paginatedMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(paginatedMembers.map((member) => member.id));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedMembers([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
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

  const getStatusBadgeVariant = (status: string): 'active' | 'suspended' | 'dormant' | 'withdrawn' => {
    switch (status) {
      case 'ACTIVE':
        return 'active';
      case 'SUSPENDED':
        return 'suspended';
      case 'DORMANT':
        return 'dormant';
      case 'WITHDRAWN':
        return 'withdrawn';
      default:
        return 'active';
    }
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedMembers.length === paginatedMembers.length && paginatedMembers.length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-[#2f9e5f] focus:ring-[#2f9e5f]"
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
          className="rounded border-gray-300 text-[#2f9e5f] focus:ring-[#2f9e5f]"
        />
      ),
    },
    {
      header: "Name",
      accessor: (row: Member) => (
        <button
          onClick={() => navigate(`/admin/members/${row.id}`)}
          className="font-medium text-[#2f9e5f] hover:underline text-left"
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
      header: "Status",
      accessor: (row: Member) => (
        <Badge variant={getStatusBadgeVariant(row.status)}>
          {row.status}
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
        <Button onClick={() => navigate("/admin/members/add")}>
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <SearchInput
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="md:col-span-8 flex items-center gap-3 justify-end flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2632] text-sm focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DORMANT">Dormant</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
              <select
                value={membershipFilter}
                onChange={(e) => {
                  setMembershipFilter(e.target.value as typeof membershipFilter);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2632] text-sm focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="REGULAR">Regular</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as typeof sortBy);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a2632] text-sm focus:ring-2 focus:ring-[#2f9e5f] focus:border-transparent"
              >
                <option value="joinDate">Join Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
              </select>
              <button
                onClick={toggleSortOrder}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
              >
                <span className="material-symbols-outlined text-gray-600 dark:text-gray-400">
                  {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
                </span>
              </button>
            </div>
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
            {paginatedMembers.map((member) => (
              <tr
                key={member.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    !target.closest('input[type="checkbox"]') &&
                    !target.closest("button")
                  ) {
                    navigate(`/admin/members/${member.id}`);
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={sortedMembers.length}
      />
    </div>
  );
};

export default MemberList;
