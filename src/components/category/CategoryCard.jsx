import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Card, Image, Popconfirm, Skeleton, Tag } from "antd";

const CategoryCard = ({ user, onToggleStatus, onEdit, imageUrls }) => {
  const {
    id,
    category_name,
    category_image,
    category_sort_order,
    is_active,
    _match,
  } = user;

  const isActive = is_active === "true";

  const avatarSrc = category_image
    ? `${imageUrls.userImageBase}${category_image}?v=${Math.random()}`
    : imageUrls.noImage;
  return (
    <Card
      hoverable
      className="rounded-2xl shadow-md border border-gray-100 transition-all duration-200 hover:shadow-lg p-4"
      styles={{ body: { padding: 0 } }}
    >
      <div className="relative w-full overflow-hidden rounded-lg mb-3 h-[120px] bg-gray-50">
        <div className="absolute top-2 left-2 z-10 bg-[#e6f2f2] text-[#006666] text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
          {category_sort_order || ""}
        </div>

        <Image
          src={avatarSrc}
          alt="Category"
          className="w-full h-full object-cover"
          wrapperClassName="w-full h-full"
          fallback={imageUrls.noImage}
          placeholder={
            <Skeleton.Image
              active
              className="!w-full !h-full !flex !items-center !justify-center rounded-lg"
            />
          }
        />
      </div>

      <div className="px-2 mb-4">
        <span className="text-base font-semibold text-gray-800 mb-4 block">
          {category_name || ""}
        </span>

        <div className="flex items-center justify-between gap-2 w-full">
          <Tag
            icon={
              isActive ? (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              ) : (
                <CloseCircleTwoTone twoToneColor="#ff4d4f" />
              )
            }
            color={isActive ? "green" : "red"}
            className="px-2 py-0.5 rounded-full text-sm"
          >
            {isActive ? "Active" : "Inactive"}
          </Tag>
          <div className="flex gap-2 w-full">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              onClick={() => onEdit(id)}
              className="bg-[#006666] hover:!bg-[#004d4d]"
              block
            />
            <Popconfirm
              title={`Mark category as ${isActive ? "Inactive" : "Active"}?`}
              onConfirm={() => onToggleStatus(user)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                icon={isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                size="small"
                type="dashed"
                block
              />
            </Popconfirm>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CategoryCard;
