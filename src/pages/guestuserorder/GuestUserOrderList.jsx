import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Input, Select, Spin } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GUEST_USER_ORDER_LIST } from "../../api";
import GuestUserOrderTable from "../../components/guestuserorderTable/GuestUserOrderTable";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";

const { Search } = Input;
const { Option } = Select;
const GuestUserOrderList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const navigate = useNavigate();
  const handleView = (user) => {
    navigate(`/guest-user-view/${user.id}`);
  };
  const { data, isLoading: isMutating } = useGetApiMutation({
    url: GUEST_USER_ORDER_LIST,
    queryKey: ["guestorderlist"],
  });
  const handleEdit = (user) => {
    navigate(`/guest-order-form/${user.id}`);
  };

  const handleAddUser = () => {
    navigate("/guest-order-form");
  };

  const filteredUsers = data?.data
    .filter((user) => {
      if (!statusFilter) return true; // No filter = show all
      return user.order_status === statusFilter;
    })
    .map((user) => {
      const flatString = Object.values(user)
        .filter((v) => typeof v === "string" || typeof v === "number")
        .join(" ")
        .toLowerCase();

      const matched = flatString.includes(searchTerm.toLowerCase());
      return matched ? { ...user, _match: searchTerm } : null;
    })
    .filter(Boolean);

  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[#006666]">Guest Order List</h2>

        <div className="flex-1 flex gap-4 sm:justify-end">
          <Search
            placeholder="Search user name or mobile"
            allowClear
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            className="max-w-sm"
            autoFocus
          />
          <Select
            allowClear
            placeholder="Filter by status"
            onChange={(value) => setStatusFilter(value)}
            className="w-40"
          >
            <Option value="pending">Pending</Option>
            <Option value="completed">Completed</Option>
          </Select>
          {/* <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddUser}
            className="bg-[#006666]"
          >
            Add Guest Order
          </Button> */}
        </div>
      </div>
      <div className="min-h-[26rem]">
        {isMutating ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <GuestUserOrderTable
            users={filteredUsers}
            onEdit={handleEdit}
            handleView={handleView}
          />
        ) : (
          <div className="text-center text-gray-500 py-20">No users found.</div>
        )}
      </div>
    </Card>
  );
};

export default GuestUserOrderList;
