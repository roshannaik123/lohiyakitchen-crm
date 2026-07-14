import { Button, Card, Input, Spin } from "antd";
import { useEffect, useState } from "react";
import { NOTIFICATION_LIST, UPDATE_STATUS, USER_LIST } from "../../api";
import usetoken from "../../api/usetoken";
import UserTable from "../../components/user/UserTable";
import { useApiMutation } from "../../hooks/useApiMutation";
import { App } from "antd";
import { ReloadOutlined, UserOutlined, PlusOutlined } from "@ant-design/icons";
const { Search } = Input;
import { Select } from "antd";
import NotificationTable from "../../components/notification/NotificationTable";
import NotificationForm from "./NotificationForm";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";
const { Option } = Select;
const Notification = () => {
  const [selectedId, setSelecetdId] = useState(false);
  const [open, setopenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [imageUrls, setImageUrls] = useState({
    userImageBase: "",
    noImage: "",
  });
  

  const {
    data,
    isLoading: isMutating,
    refetch,
  } = useGetApiMutation({
    url: NOTIFICATION_LIST,
    queryKey: ["notificationlist"],
  });

  useEffect(() => {
    if (data?.data) {
      const userImageObj = data.image_url?.find(
        (img) => img.image_for == "Notification"
      );
      const noImageObj = data.image_url?.find(
        (img) => img.image_for == "No Image"
      );

      setImageUrls({
        userImageBase: userImageObj?.image_url || "",
        noImage: noImageObj?.image_url || "",
      });
    }
  }, [data]);
  const handleEdit = (id) => {
    setSelecetdId(null);
    setTimeout(() => {
      setSelecetdId(id);
      setopenDialog(true);
    }, 0);
  };

  const handleAddUser = () => {
    setopenDialog(true);
    setSelecetdId(null);
  };

  const filteredUsers = data?.data
    ?.filter((user) => {
      if (statusFilter === "active" && user.is_active !== "true") return false;
      if (statusFilter === "inactive" && user.is_active !== "false")
        return false;
      return true;
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
        <h2 className="text-2xl font-bold text-[#006666]">Notification List</h2>

        <div className="flex-1 flex gap-4 sm:justify-end">
          <Search
            placeholder="Search"
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
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddUser}
            className="bg-[#006666]"
          >
            Add Notification
          </Button>
        </div>
      </div>
      <div className="min-h-[26rem]">
        {isMutating ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <NotificationTable
            imageUrls={imageUrls}
            users={filteredUsers}
            onEdit={handleEdit}
          />
        ) : (
          <div className="text-center text-gray-500 py-20">No users found.</div>
        )}
      </div>
      {open && (
        <NotificationForm
          open={open}
          setOpenDialog={setopenDialog}
          userId={selectedId}
          fetchUser={refetch}
        />
      )}
    </Card>
  );
};

export default Notification;
