import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Member } from "../../types";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

// Mock data - replace with API call
const mockMember: Member = {
  id: 1,
  name: "Sophia Clark",
  email: "sophia.clark@email.com",
  membershipType: "PREMIUM",
  joinDate: "2023-01-15T10:30:00",
};

const MemberDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [member, setMember] = useState<Member>(mockMember);
  const [formData, setFormData] = useState({
    name: member.name,
    email: member.email,
    membershipType: member.membershipType,
    joinDate: member.joinDate.split("T")[0],
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: member.name,
      email: member.email,
      membershipType: member.membershipType,
      joinDate: member.joinDate.split("T")[0],
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to update member
    console.log("Update member:", formData);
    setMember({
      ...member,
      ...formData,
      joinDate: formData.joinDate,
    });
    setIsEditing(false);
  };

  const handlePasswordReset = () => {
    // TODO: API call to reset password
    console.log("Reset password for member:", id);
    alert("Password reset email sent to " + member.email);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Member Details</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage member information.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a2632] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Member Information
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                ID: {member.id}
              </p>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit}>
                <span className="material-symbols-outlined">edit</span>
                Edit
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g., Sophia Clark"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g., sophia.c@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Membership Type
              </label>
              {isEditing ? (
                <Select
                  value={formData.membershipType}
                  onChange={(e) => setFormData({ ...formData, membershipType: e.target.value })}
                  options={[
                    { value: "REGULAR", label: "Standard" },
                    { value: "PREMIUM", label: "Premium" },
                  ]}
                />
              ) : (
                <div className="py-2">
                  <Badge variant={member.membershipType === "PREMIUM" ? "premium" : "standard"}>
                    {member.membershipType}
                  </Badge>
                </div>
              )}
            </div>
            <Input
              label="Join Date"
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              disabled={!isEditing}
              required
            />
          </div>

          {isEditing && (
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="secondary" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <span className="material-symbols-outlined">save</span>
                Save Changes
              </Button>
            </div>
          )}
        </form>

        {!isEditing && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account Actions
            </h4>
            <Button variant="danger" onClick={handlePasswordReset}>
              <span className="material-symbols-outlined">lock_reset</span>
              Reset Password
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <Button variant="secondary" onClick={() => navigate("/members")}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to List
        </Button>
      </div>
    </div>
  );
};

export default MemberDetail;
