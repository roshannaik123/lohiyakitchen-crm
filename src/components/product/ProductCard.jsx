import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Card, Carousel, Image, Popconfirm, Tag, Skeleton } from "antd";

const ProductCard = ({ user, onToggleStatus, onEdit, imageUrls }) => {
  const {
    // id,
    product_name,
    product_unit_value,
    unit_name,
    is_active,
    product_mrp,
    product_selling_price,
    product_spl_offer_price,
    subs,
  } = user;
  const isActive = is_active == "true";
  const offerPrice = parseFloat(product_spl_offer_price);

  return (
    <Card
      hoverable
      className="relative rounded-xl shadow border border-gray-100 transition-all duration-200 hover:shadow-lg"
      styles={{ body: { padding: "0rem" } }}
    >
      {offerPrice > 0 && (
        <div className="absolute left-0 top-5 rotate-[-45deg] bg-gradient-to-r from-red-600 to-red-400 text-white px-4 py-1 text-xs font-bold shadow-lg tracking-wider z-10 rounded-sm">
          OFFER
        </div>
      )}

      <div
        className="w-full mb-4 relative overflow-hidden rounded-lg"
        style={{ height: "180px" }}
      >
        <Carousel autoplay autoplaySpeed={2500} className="w-full h-full">
          {(Array.isArray(subs)
            ? subs.filter((item) => item.is_active === "true")
            : [null]
          ).map((item, index) => {
            const img = item?.product_images ?? null;
            const src = img
              ? `${imageUrls.userImageBase + img}?v=${Math.random()}`
              : imageUrls.noImage;

            return (
              <div
                key={index}
                className="w-full h-[180px] flex items-center justify-center bg-white"
              >
                <Image
                  src={src}
                  alt={`Product image ${index + 1}`}
                  preview={true}
                  className="w-full h-full object-cover rounded-lg"
                  wrapperClassName="w-full h-full"
                  placeholder={
                    <Skeleton.Image
                      active
                      className="!w-full !h-full !flex !items-center !justify-center rounded-lg"
                    />
                  }
                />
              </div>
            );
          })}
        </Carousel>
      </div>

      <div className="px-2 mb-2">
        <h3 className="text-base font-semibold mb-2 text-[#333] leading-tight">
          {product_name || ""}
        </h3>

        <div className="flex justify-between items-center mb-2 text-sm text-gray-700">
          <div>
            <span className="font-medium mb-0">MRP:</span> {product_mrp || ""}
          </div>
          <span className="text-gray-600 font-medium bg-[#e6f2f2] px-2 py-0.5 rounded-full">
            {product_unit_value || ""}
            {unit_name}
          </span>
        </div>

        <div className="text-sm text-gray-700 ">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="font-medium">Selling:</span>{" "}
              <span className="text-gray-600">
                {product_selling_price || ""}
              </span>
            </div>
            <div>
              <span className="font-medium">Offer:</span>{" "}
              <span className="text-gray-600">
                {offerPrice > 0 ? (
                  product_spl_offer_price || ""
                ) : (
                  <span className="text-red-400">0</span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex gap-2 items-center j">
              <Tag
                color={isActive ? "green" : "red"}
                icon={
                  isActive ? (
                    <CheckCircleTwoTone twoToneColor="#52c41a" />
                  ) : (
                    <CloseCircleTwoTone twoToneColor="#ff4d4f" />
                  )
                }
                className="px-2 py-0.5 rounded-full"
              >
                {isActive ? "Active" : "Inactive"}
              </Tag>
            </div>

            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit(user?.id)}
              className="bg-[#006666]"
              block
            />

            <Popconfirm
              title={`Mark user as ${isActive ? "Inactive" : "Active"}?`}
              onConfirm={() => onToggleStatus(user)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="dashed"
                size="small"
                block
                icon={isActive ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              />
            </Popconfirm>
          </div>
        </div>

        {/* Status + Actions */}
      </div>
    </Card>
  );
};

export default ProductCard;
