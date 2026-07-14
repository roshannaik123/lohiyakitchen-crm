import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Select,
  Spin,
  Switch,
  Upload,
  App,
  Popconfirm,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CATEGORY_ACTIVE,
  FETCH_UNIT,
  PRODUCT_LIST,
  PRODUCT_SUB,
} from "../../api";
import usetoken from "../../api/usetoken";
import { useApiMutation } from "../../hooks/useApiMutation";
import CropImageModal from "../../components/common/CropImageModal";
import CardHeader from "../../components/common/CardHeader";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";

const ProductForm = () => {
  const { message } = App.useApp();
  const token = usetoken();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropIndex, setCropIndex] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const { trigger: DeleteTrigger } = useApiMutation();
  const [form] = Form.useForm();
  const [categoryData, setCategoryData] = useState([]);
  const [unitData, setUnitData] = useState([]);
  const [productForms, setProductForms] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    const [categoryRes, unitRes] = await Promise.all([
      fetchTrigger({
        url: CATEGORY_ACTIVE,
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetchTrigger({
        url: FETCH_UNIT,
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    if (categoryRes?.data) setCategoryData(categoryRes.data);
    if (unitRes?.data) setUnitData(unitRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchProduct = async () => {
    const res = await fetchTrigger({
      url: `${PRODUCT_LIST}/${id}`,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res?.data) return;

    const userData = res.data;
    const userImage = res.image_url?.find((i) => i.image_for === "Product");
    const noImage = res.image_url?.find((i) => i.image_for === "No Image");
    const baseImageUrl = userImage?.image_url || "";
    const noImageUrl = noImage?.image_url || "";

    form.setFieldsValue({
      ...userData,

      category_ids: userData.category_ids
        ? userData.category_ids.split(",").map((id) => Number(id))
        : [],
      is_active: userData.is_active === "true" || userData.is_active === true,
    });

    const subs = (userData.subs || []).map((sub) => ({
      id: sub.id,
      product_id: sub.product_id,
      is_default: sub.is_default == "true",
      is_active: sub.is_active == "true",
      preview: sub.product_images
        ? `${baseImageUrl}${sub.product_images}`
        : noImageUrl,
      product_images: null,
    }));

    setProductForms(subs);
  };

  useEffect(() => {
    if (isEditMode) fetchProduct();
    else {
      setProductForms([
        {
          id: "",
          is_default: false,
          is_active: false,
          preview: "",
          product_images: null,
        },
      ]);
    }
  }, [id]);

  useEffect(() => {
    form.setFieldsValue({ subs: productForms });
  }, [productForms]);

  const updateProductField = (index, field, value) => {
    const updated = [...productForms];
    if (field === "is_default" && value === true) {
      updated.forEach((item, i) => (item.is_default = i === index));
    } else {
      updated[index][field] = value;
    }
    setProductForms(updated);
  };

  const handleImageUpload = (index, file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result);
      setCropIndex(index);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    return false;
  };
  const handleCropComplete = async ({ blob, fileUrl }) => {
    console.log(blob, "blob");
    console.log(fileUrl, "previewUrl");

    const file = new File([blob], "cropped-image.jpg", {
      type: blob.type || "image/jpeg",
    });

    const updated = [...productForms];
    updated[cropIndex] = {
      ...updated[cropIndex],
      product_images: file,
      preview: fileUrl,
    };

    setProductForms(updated);
    setCropModalOpen(false);
  };

  useEffect(() => {
    return () => {
      productForms.forEach((form) => {
        if (form.preview) {
          URL.revokeObjectURL(form.preview);
        }
      });
    };
  }, []);

  const handleFinish = async (values) => {
    try {
      const subs = values.subs || [];
      const allHaveImages = productForms.every(
        (item) => item.preview || item.product_images instanceof File
      );
      if (!allHaveImages) {
        message.error("All product subs must have an image.");
        return;
      }

      if (subs.length === 0) {
        message.error("At least one product sub is required.");
        return;
      }

      const hasDefault = productForms.some((item) => item.is_default === true);
      if (!hasDefault) {
        message.error("Please mark one sub as default.");
        return;
      }

      const formData = new FormData();
      formData.append("category_ids", values.category_ids || "");
      formData.append("product_name", values.product_name || "");
      formData.append(
        "product_short_description",
        values.product_short_description || ""
      );
      formData.append("product_brand", values.product_brand || "");
      formData.append("product_unit_id", values.product_unit_id || "");
      formData.append("product_unit_value", values.product_unit_value || "");
      formData.append("product_mrp", values.product_mrp || "");
      formData.append(
        "product_selling_price",
        values.product_selling_price || ""
      );
      formData.append(
        "product_spl_offer_price",
        values.product_spl_offer_price || ""
      );

      if (isEditMode) {
        formData.append("is_active", values.is_active ? "true" : "false");
      }

      productForms.forEach((item, index) => {
        if (isEditMode) {
          formData.append(`subs[${index}][id]`, item.id || "");
        }
        formData.append(
          `subs[${index}][is_default]`,
          item.is_default ? "true" : "false"
        );
        formData.append(
          `subs[${index}][is_active]`,
          item.is_active ? "true" : "false"
        );
        if (item.product_images instanceof File) {
          formData.append(
            `subs[${index}][product_images]`,
            item.product_images
          );
        }
      });
      // for (let pair of formData.entries()) {
      //   console.log(`${pair[0]}:`, pair[1]);
      // }
      await submitTrigger({
        url: isEditMode ? `${PRODUCT_LIST}/${id}?_method=PUT` : PRODUCT_LIST,
        method: "post",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      message.success(
        `Product ${isEditMode ? "updated" : "created"} successfully!`
      );
      navigate("/product");
    } catch (error) {
      console.error("Error submitting Product:", error);

      const errMsg = error?.response?.data?.message;

      if (typeof errMsg === "string") {
        message.error(errMsg);
      } else if (typeof errMsg === "object") {
        const flatErrors = Object.values(errMsg).flat();
        flatErrors.forEach((msg) => {
          message.error(msg);
        });
      } else {
        message.error("Something went wrong while submitting the Product.");
      }
    }
  };
  const handleDelete = async (id) => {
    try {
      if (id) {
        const res = await DeleteTrigger({
          url: `${PRODUCT_SUB}/${id}`,
          method: "delete",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.code == 201) {
          message.success(res.message || "Product removed successfully");
          fetchProduct();
        }
      }
    } catch (error) {
      console.error("Delete failed", error);
      message.error("Failed to delete product");
    }
  };
  return fetchLoading ? (
    <div className="flex justify-center py-20">
      <Spin size="large" />
    </div>
  ) : (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
        className="mt-4"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      >
        <Card
          title={
            <CardHeader title={`${isEditMode ? "Edit" : "Create"} Product`} />
          }
          extra={
            <div className="flex items-center gap-2">
              {isEditMode && (
                <Form.Item
                  name="is_active"
                  valuePropName="checked"
                  style={{ marginBottom: "0px" }}
                >
                  <Switch />
                </Form.Item>
              )}
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Form.Item
              name="category_ids"
              label={
                <span>
                  Category <span className="text-red-500">*</span>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please select at least one category",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select Categories"
                allowClear
                autoFocus
                showSearch
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {categoryData.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="product_name"
              label={
                <span>
                  Product Name <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true, message: "Product name is required" }]}
            >
              <Input maxLength={100} />
            </Form.Item>

            <Form.Item name="product_brand" label="Brand">
              <Input maxLength={100} />
            </Form.Item>
            <div className="grid grid-cols-2 gap-2 ">
              <Form.Item
                name="product_unit_value"
                label={
                  <span>
                    Unit Value<span className="text-red-500">*</span>
                  </span>
                }
                rules={[
                  { required: true, message: "Unit value is required" },
                  {
                    pattern: /^\d+(\.\d{1,2})?$/,
                    message: "Enter a valid number (e.g. 34.4)",
                  },
                ]}
              >
                <Input
                  inputMode="decimal"
                  onKeyDown={(e) => {
                    const allowedKeys = [
                      "Backspace",
                      "Tab",
                      "ArrowLeft",
                      "ArrowRight",
                      "Delete",
                    ];
                    const isCtrlCombo = e.ctrlKey || e.metaKey;

                    if (
                      allowedKeys.includes(e.key) ||
                      isCtrlCombo ||
                      /[0-9.]/.test(e.key)
                    ) {
                      return;
                    }

                    e.preventDefault();
                  }}
                  maxLength={8}
                />
              </Form.Item>

              <Form.Item
                name="product_unit_id"
                label={
                  <span>
                    Unit<span className="text-red-500">*</span>
                  </span>
                }
                rules={[{ required: true, message: "Select a unit" }]}
              >
                <Select placeholder="Select Unit">
                  {unitData.map((unit) => (
                    <Select.Option key={unit.id} value={unit.id}>
                      {unit.unit}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div className="col-span-2 grid grid-cols-3 gap-4">
              <Form.Item
                name="product_mrp"
                label={
                  <span>
                    MRP<span className="text-red-500">*</span>
                  </span>
                }
                rules={[
                  { required: true, message: "MRP is required" },
                  {
                    pattern: /^\d+(\.\d{1,2})?$/,
                    message: "Enter a valid number (e.g. 34.4)",
                  },
                ]}
              >
                <Input
                  inputMode="decimal"
                  onKeyDown={(e) => {
                    const allowedKeys = [
                      "Backspace",
                      "Tab",
                      "ArrowLeft",
                      "ArrowRight",
                      "Delete",
                    ];
                    const isCtrlCombo = e.ctrlKey || e.metaKey;

                    if (
                      allowedKeys.includes(e.key) ||
                      isCtrlCombo ||
                      /[0-9.]/.test(e.key)
                    ) {
                      return;
                    }

                    e.preventDefault();
                  }}
                  maxLength={8}
                />
              </Form.Item>

              <Form.Item
                name="product_selling_price"
                label={
                  <span>
                    Selling Price<span className="text-red-500">*</span>
                  </span>
                }
                rules={[
                  { required: true, message: "Selling price is required" },
                  {
                    pattern: /^\d+(\.\d{1,2})?$/,
                    message: "Enter a valid number (e.g. 34.4)",
                  },
                ]}
              >
                <Input
                  inputMode="decimal"
                  onKeyDown={(e) => {
                    const allowedKeys = [
                      "Backspace",
                      "Tab",
                      "ArrowLeft",
                      "ArrowRight",
                      "Delete",
                    ];
                    const isCtrlCombo = e.ctrlKey || e.metaKey;

                    if (
                      allowedKeys.includes(e.key) ||
                      isCtrlCombo ||
                      /[0-9.]/.test(e.key)
                    ) {
                      return;
                    }

                    e.preventDefault();
                  }}
                  maxLength={8}
                />
              </Form.Item>

              <Form.Item
                name="product_spl_offer_price"
                label="Offer Price"
                rules={[
                  {
                    pattern: /^\d+(\.\d{1,2})?$/,
                    message: "Enter a valid number (e.g. 34.4)",
                  },
                ]}
              >
                <Input
                  inputMode="decimal"
                  onKeyDown={(e) => {
                    const allowedKeys = [
                      "Backspace",
                      "Tab",
                      "ArrowLeft",
                      "ArrowRight",
                      "Delete",
                    ];
                    const isCtrlCombo = e.ctrlKey || e.metaKey;

                    if (
                      allowedKeys.includes(e.key) ||
                      isCtrlCombo ||
                      /[0-9.]/.test(e.key)
                    ) {
                      return;
                    }

                    e.preventDefault();
                  }}
                  maxLength={8}
                />
              </Form.Item>
            </div>
            <Form.Item
              name="product_short_description"
              label="Description"
              className="md:col-span-2"
            >
              <Input.TextArea rows={1} />
            </Form.Item>
          </div>

          <Form.List name="subs">
            {(fields, { add, remove }) => (
              <>
                <div className="flex justify-between items-center mb-4">
                  <strong>Product Sub Images</strong>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      const newSub = {
                        id: "",
                        is_default: false,
                        is_active: false,
                        product_images: null,
                        preview: "",
                      };
                      setProductForms([...productForms, newSub]);
                      add();
                    }}
                  >
                    Add Images
                  </Button>
                </div>

                {fields.map(({ key, name, ...restField }, index) => {
                  const current = productForms[index] || {};

                  const isDefault = current.is_default;
                  const isActive = current.is_active;

                  return (
                    <Card
                      key={key}
                      size="small"
                      style={{ marginBottom: "10px" }}
                      title={`Image ${index + 1}`}
                      extra={
                        isEditMode && isDefault ? (
                          // 🚫 In edit mode → Default image cannot be deleted
                          <Tooltip title="Default image cannot be deleted">
                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              disabled
                            >
                              Delete
                            </Button>
                          </Tooltip>
                        ) : current.id ? (
                          <Popconfirm
                            title="Are you sure you want to delete this image?"
                            onConfirm={() => handleDelete(current.id)}
                            okText="Yes"
                            cancelText="No"
                            disabled={fields.length === 1}
                          >
                            <Button
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              disabled={fields.length === 1}
                            >
                              Delete
                            </Button>
                          </Popconfirm>
                        ) : (
                          <Button
                            size="small"
                            onClick={() => {
                              const updated = [...productForms];
                              updated.splice(index, 1);
                              setProductForms(updated);
                              remove(name);
                            }}
                            disabled={fields.length === 1}
                          >
                            Remove
                          </Button>
                        )
                      }
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Upload */}
                        <Form.Item
                          {...restField}
                          name={[name, "product_images"]}
                          label="Product Image"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar
                              size={36}
                              src={current.preview}
                              icon={<UserOutlined />}
                            />
                            <Upload
                              showUploadList={false}
                              accept="image/*"
                              beforeUpload={(file) => {
                                handleImageUpload(index, file);
                                const reader = new FileReader();
                                reader.readAsDataURL(file);
                                return false;
                              }}
                            >
                              <Button icon={<UploadOutlined />}>Upload</Button>
                            </Upload>
                          </div>
                        </Form.Item>

                        {/* Default Switch */}
                        <Form.Item
                          name={[name, "is_default"]}
                          label="Default"
                          valuePropName="checked"
                        >
                          <Tooltip
                            title={
                              isEditMode
                                ? !isActive
                                  ? "Inactive cannot make Default"
                                  : isDefault &&
                                    productForms.filter((i) => i.is_default)
                                      .length === 1
                                  ? "At least one sub must remain default"
                                  : ""
                                : ""
                            }
                          >
                            <Switch
                              checked={isDefault}
                              onChange={(checked) => {
                                updateProductField(
                                  index,
                                  "is_default",
                                  checked
                                );
                              }}
                              disabled={
                                isEditMode &&
                                (!isActive ||
                                  (isDefault &&
                                    productForms.filter((i) => i.is_default)
                                      .length === 1))
                              }
                            />
                          </Tooltip>
                        </Form.Item>

                        {isEditMode && (
                          <Form.Item
                            name={[name, "is_active"]}
                            label="Active"
                            valuePropName="checked"
                          >
                            <Tooltip
                              title={
                                isDefault
                                  ? "Default  cannot be Inactive"
                                  : isActive &&
                                    productForms.filter((i) => i.is_active)
                                      .length === 1
                                  ? "At least one must remain Active"
                                  : ""
                              }
                            >
                              <Switch
                                checked={isActive}
                                onChange={(checked) => {
                                  updateProductField(
                                    index,
                                    "is_active",
                                    checked
                                  );
                                }}
                                disabled={
                                  isDefault ||
                                  (isActive &&
                                    productForms.filter((i) => i.is_active)
                                      .length === 1)
                                }
                              />
                            </Tooltip>
                          </Form.Item>
                        )}
                      </div>
                    </Card>
                  );
                })}

                <Form.Item name="is_default_error" style={{ display: "none" }}>
                  <div />
                </Form.Item>
              </>
            )}
          </Form.List>

          <div className="mt-6 text-center">
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitLoading}
                style={{ marginRight: 8 }}
              >
                {isEditMode ? "Update" : "Submit"}
              </Button>
              <Button danger type="default" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </Form.Item>
          </div>
        </Card>
      </Form>

      <CropImageModal
        open={cropModalOpen}
        imageSrc={cropImageSrc}
        onCancel={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        maxCropSize={{ width: 700, height: 800 }}
        // maxCropSize={{ width: 700, height: 1000 }}
        title="Crop Product Image"
        cropstucture={false}
      />
    </>
  );
};

export default ProductForm;
