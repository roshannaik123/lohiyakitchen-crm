import {
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Image, Skeleton, Space, Tag, Tooltip } from "antd";
import STTable from "../STTable/STTable";

const NotificationTable = ({ users, onEdit, imageUrls }) => {
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
      title: "Avatar",
      dataIndex: "notification_images",
      key: "avatar",
      render: (_, user) => (
        <div className="flex justify-center p-2">
          <Image
            width={50}
            height={50}
            src={
              user.notification_images
                ? imageUrls.userImageBase + user.notification_images
                : imageUrls.noImage
            }
            alt="Slider"
            className="object-cover"
            wrapperClassName="w-full h-full"
            placeholder={
              <Skeleton.Image
                active
                className="!w-full !h-full !flex !items-center !justify-center rounded-lg"
              />
            }
          />
        </div>
      ),
    },

    {
      title: "Name",
      dataIndex: "notification_heading",
      key: "notification_heading",
      render: (_, user) =>
        highlightMatch(user.notification_heading, user._match),
    },
    {
      width: 430,
      title: "Description",
      dataIndex: "notification_description",
      key: "notification_description",
      render: (_, user) =>
        highlightMatch(user.notification_description, user._match),
    },

    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (_, user) => {
        const isActive = user.is_active === "true" || user.is_active === true;
        return (
          <div className="flex justify-center">
            <Tag color={isActive ? "green" : "red"}>
              {isActive ? "Active" : "Inactive"}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, user) => {
        return (
          <Space>
            <Tooltip title="Edit User">
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="small"
                onClick={() => onEdit(user.id)}
                className="bg-[#006666]"
              />
            </Tooltip>
          </Space>
        );
      },
      width: 130,
    },
  ];

  return <STTable data={users} columns={columns} />;
};

export default NotificationTable;
