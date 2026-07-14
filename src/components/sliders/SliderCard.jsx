import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  EditOutlined
} from "@ant-design/icons";
import { Button, Image, Skeleton, Tag } from "antd";

const SliderCard = ({ users, onEdit, imageUrls }) => {
  const { id, slider_image, slider_sort, is_active, _match } = users;

  const isActive = is_active === "true";

  const avatarSrc = slider_image
    ? `${imageUrls.userImageBase}${slider_image}?v=${Math.random()}`
    : imageUrls.noImage;

  const highlightMatch = (text, match) => {
    if (!match || !text) return text;
    const regex = new RegExp(`(${match})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === match.toLowerCase() ? (
        <mark
          key={i}
          className="bg-[#006666]/20 text-[#006666] font-medium px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-lg  h-[120px] bg-gray-50 shadow-2xl">
        <div className="absolute top-2 left-2 z-10 bg-[#e6f2f2] text-[#006666] text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
          {highlightMatch(slider_sort || "", _match)}
        </div>

        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
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
          <Button
            icon={<EditOutlined />}
            size="small"
            type="primary"
            onClick={() => onEdit(id)}
            className="bg-[#006666] hover:!bg-[#004d4d]"
          />
        </div>

        <Image
          src={avatarSrc}
          alt="Category"
          className="w-full h-full object-cover"
          fallback={imageUrls.noImage}
          wrapperClassName="w-full h-full"
          placeholder={
            <Skeleton.Image
              active
              className="!w-full !h-full !flex !items-center !justify-center rounded-lg"
            />
          }
        />
      </div>
    </div>
  );
};

export default SliderCard;
