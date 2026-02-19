import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Member } from "../../../shared/types";
import Input from "../../../shared/components/common/Input";
import Select from "../../../shared/components/common/Select";
import Button from "../../../shared/components/common/Button";
import Badge from "../../../shared/components/common/Badge";
import { memberService } from "../../../services/memberService";
import axios from "axios";
import type { ApiError } from "../../../shared/types";

const MemberDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    membershipType: "REGULAR" as Member["membershipType"],
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    memberService.getMember(Number(id))
      .then((data) => {
        setMember(data);
        setFormData({
          name: data.name,
          email: data.email,
          membershipType: data.membershipType,
        });
      })
      .catch(() => setError("회원 정보를 불러오는 데 실패했습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        membershipType: member.membershipType,
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    setSaveLoading(true);
    try {
      const updated = await memberService.updateMember(member.id, {
        name: formData.name,
        email: formData.email,
        membershipType: formData.membershipType,
      });
      setMember(updated);
      setIsEditing(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data as ApiError | undefined;
        alert(apiError?.message ?? "회원 정보 수정에 실패했습니다.");
      } else {
        alert("서버에 연결할 수 없습니다.");
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordReset = () => {
    if (!member) return;
    alert(`${member.email} 로 비밀번호 재설정 이메일을 발송했습니다.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-outlined text-4xl text-[#2f9e5f] animate-spin">progress_activity</span>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="max-w-7xl mx-auto text-center py-10">
        <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
          {error ?? "Member Not Found"}
        </h2>
        <Button
          variant="secondary"
          onClick={() => navigate("/admin/members")}
          className="mt-6"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
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
                  onChange={(e) => setFormData({ ...formData, membershipType: e.target.value as Member["membershipType"] })}
                  options={[
                    { value: "REGULAR", label: "Regular" },
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Join Date
              </label>
              <div className="py-2 text-gray-900 dark:text-white">
                {new Date(member.joinDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="secondary" type="button" onClick={handleCancel} disabled={saveLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveLoading}>
                {saveLoading ? (
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined">save</span>
                )}
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
        <Button variant="secondary" onClick={() => navigate("/admin/members")}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to List
        </Button>
      </div>
    </div>
  );
};

export default MemberDetail;
