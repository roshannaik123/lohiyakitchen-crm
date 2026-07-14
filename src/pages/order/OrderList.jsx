import { PlusOutlined } from "@ant-design/icons";
import { App, Button, Card, Input, Spin } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ORDER_LIST } from "../../api";
import usetoken from "../../api/usetoken";
import OrderTable from "../../components/order/OrderTable";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";

const { Search } = Input;
const OrderList = () => {
  const token = usetoken();
  const { message } = App.useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const { trigger: DeleteTrigger } = useApiMutation();
  const navigate = useNavigate();

  const { data, isLoading: isMutating } = useGetApiMutation({
    url: ORDER_LIST,
    queryKey: ["orderlist"],
  });
  console.log(data);
  const handleView = (user) => {
    navigate(`/order-view/${user.id}`);
  };
  const handleEdit = (user) => {
    navigate(`/order-form/${user.id}`);
  };

  const handleAddUser = () => {
    navigate("/order-form");
  };

  const filteredUsers = data?.data

    .map((user) => {
      const flatString = Object.values(user)
        .filter((v) => typeof v === "string" || typeof v === "number")
        .join(" ")
        .toLowerCase();

      const matched = flatString.includes(searchTerm.toLowerCase());
      return matched ? { ...user, _match: searchTerm } : null;
    })
    .filter(Boolean);
  const handleDelete = async (user) => {
    try {
      if (user.id) {
        const res = await DeleteTrigger({
          url: `${ORDER_LIST}/${user.id}`,
          method: "delete",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.code == 201) {
          message.success(res.message || "Product removed successfully");
          fetchOrders();
        }
      }
    } catch (error) {
      console.error("Delete failed", error);
      message.error("Failed to delete product");
    }
  };
  return (
    <Card>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[#006666]"> Order List</h2>

        <div className="flex-1 flex gap-4 sm:justify-end">
          <Search
            placeholder="Search"
            allowClear
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            className="max-w-sm"
            autoFocus
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddUser}
            className="bg-[#006666]"
          >
            Add Order
          </Button>
        </div>
      </div>
      <div className="min-h-[26rem]">
        {isMutating ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <OrderTable
            users={filteredUsers}
            onEdit={handleEdit}
            handleView={handleView}
            handleDelete={handleDelete}
          />
        ) : (
          <div className="text-center text-gray-500 py-20">No data found.</div>
        )}
      </div>
    </Card>
  );
};

export default OrderList;
