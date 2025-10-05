import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";

const MemberAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    membershipType: "REGULAR",
    joinDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to create member
    console.log("Create member:", formData);
    navigate("/members");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Member</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Create a new member profile.</p>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Member Information</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Please fill out the form below.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g., Sophia Clark"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g., sophia.c@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Membership Type"
              value={formData.membershipType}
              onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
              options={[
                { value: "REGULAR", label: "Standard" },
                { value: "PREMIUM", label: "Premium" },
              ]}
            />
            <Input
              label="Join Date"
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="secondary" type="button" onClick={() => navigate("/members")}>
              Cancel
            </Button>
            <Button type="submit">
              <span className="material-symbols-outlined">add</span>
              Add Member
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberAdd;
