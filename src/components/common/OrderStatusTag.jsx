// components/OrderStatusTag.jsx
import React from "react";
import { Tag } from "antd";

const statusColorMap = {
  pending: "orange",
  confirmed: "blue",
  preparing: "gold",
  ready: "lime",
  "out for delivery": "cyan",
  delivered: "green",
  cancel: "red",
};

const OrderStatusTag = ({ status }) => {
  const color = statusColorMap[status?.toLowerCase()] || "default";

  return (
    <div className="flex justify-center">
      <Tag color={color}>{status ? status.toUpperCase() : ""}</Tag>
    </div>
  );
};

export default OrderStatusTag;
