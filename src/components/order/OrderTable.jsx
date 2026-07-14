import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Tooltip } from "antd";
import dayjs from "dayjs";
import STTable from "../STTable/STTable";
import OrderStatusTag from "../common/OrderStatusTag";

const OrderTable = ({ users, onEdit, handleView, handleDelete }) => {
  const highlightMatch = (text, match) => {
    if (!match || !text) return text;
    const regex = new RegExp(`(${match})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === match.toLowerCase() ? (
        <mark
          key={index}
          className="bg-[#006666] text-white px-1 rounded"
          style={{ backgroundColor: "#006666", color: "white" }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const columns = [
    {
      title: "Order No",
      dataIndex: "order_no",
      key: "order_no",
      render: (_, user) => highlightMatch(user.order_no, user._match),
    },
    {
      title: "Date",
      dataIndex: "order_date",
      key: "order_date",
      render: (_, user) =>
        highlightMatch(
          dayjs(user.order_date).format("DD-MM-YYYY"),
          user._match
        ),
    },

    {
      title: "Name",
      dataIndex: "company_name",
      key: "company_name",
      render: (_, user) => highlightMatch(user.company_name, user._match),
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (_, user) => highlightMatch(user.total_amount, user._match),
    },

    {
      title: "Status",
      dataIndex: "order_status",
      key: "order_status",
      render: (_, user) => {
        return <OrderStatusTag status={user.order_status} />;
      },
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, id) => {
        return (
          <Space>
            <Tooltip title="Edit Order">
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="small"
                onClick={() => onEdit(id)}
                className="bg-[#006666]"
              />
            </Tooltip>
            <Tooltip title="View Order">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleView(id)}
                className="bg-[#006666]"
              />
            </Tooltip>
            <Popconfirm
              title="Are you sure to delete this order?"
              onConfirm={() => handleDelete(id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
      width: 130,
    },
  ];

  return <STTable data={users} columns={columns} />;
};

export default OrderTable;
