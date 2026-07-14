import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Space,
  Spin,
  Switch,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import { CATEGORY_LIST } from "../../api";
import usetoken from "../../api/usetoken";
import CropImageModal from "../../components/common/CropImageModal";
import { useApiMutation } from "../../hooks/useApiMutation";

const CategoryForm = ({ open, setOpenDialog, userId, fetchUser }) => {
  const { message } = App.useApp();
  const isEditMode = userId ? true : false;
  const [form] = Form.useForm();
  const token = usetoken();
  const [initialData, setInitialData] = useState({});
  const { trigger: FetchTrigger, loading: categotyloading } = useApiMutation();
  const { trigger: SubmitTrigger, loading: submitloading } = useApiMutation();
  const [noImageUrl, setNoImageUrl] = useState("");
  const [imageBaseUrl, setImageBaseUrl] = useState("");
 

  const [cropState, setCropState] = useState({
    modalVisible: false,
    imageSrc: null,
    tempFileName: "",
    type: "",
  });
  const [categoryImageInfo, setCategoryImageInfo] = useState({
    file: null,
    fileName: "",
    preview: "",
  });
  const [bannerImageInfo, setBannerImageInfo] = useState({
    file: null,
    fileName: "",
    preview: "",
  });

  const fetchCategoryData = async () => {
    try {
      const res = await FetchTrigger({
        url: `${CATEGORY_LIST}/${userId}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res || !res.data) return;

      const userData = res.data;
      setInitialData(userData);
      form.setFieldsValue({
        category_name: userData.category_name,
        category_sort_order: userData.category_sort_order,
        category_description: userData.category_description,
        is_active: userData.is_active,
      });

      const userImage = res.image_url?.find((i) => i.image_for === "Category");
      const noImage = res.image_url?.find((i) => i.image_for === "No Image");
      setImageBaseUrl(userImage?.image_url || "");
      setNoImageUrl(noImage?.image_url || "");
    } catch (err) {
      console.error("Error fetching category data:", err);
      message.error("Failed to load category data.");
    }
  };

  useEffect(() => {
    setInitialData({});

    if (isEditMode) {
      fetchCategoryData();
    } else {
      form.resetFields();
      setInitialData({});
      setCategoryImageInfo({ file: null, fileName: "", preview: "" });
      setBannerImageInfo({ file: null, fileName: "", preview: "" });
    }
  }, [userId]);

  const handleProfileSave = async (values) => {
    try {
      const formData = new FormData();
      formData.append("category_name", values.category_name || "");
      formData.append("category_sort_order", values.category_sort_order || "");
      formData.append("category_description", values.category_description);

      if (categoryImageInfo.file) {
        formData.append("category_image", categoryImageInfo.file);
      }

      if (bannerImageInfo.file) {
        formData.append("category_banner_image", bannerImageInfo.file);
      }
      if (isEditMode) {
        formData.append("is_active", values.is_active);
      }
      if (isEditMode) {
        formData.append("is_active", values.is_active);
      }
      const respose = await SubmitTrigger({
        url: isEditMode
          ? `${CATEGORY_LIST}/${userId}?_method=PUT`
          : CATEGORY_LIST,
        method: "post",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (respose.code == 201) {
        message.success(respose.message || "Category updated successfully!");
        setOpenDialog(false);
        fetchUser();
      } else {
        message.error(respose.message || "Category Failed ");
      }
    } catch (error) {
      console.error("Error submitting category:", error);

      const errMsg = error?.response?.data?.message;

      if (typeof errMsg === "string") {
        message.error(errMsg);
      } else if (typeof errMsg === "object") {
        const flatErrors = Object.values(errMsg).flat();
        flatErrors.forEach((msg) => {
          message.error(msg);
        });
      } else {
        message.error("Something went wrong while submitting the Category.");
      }
    }
  };

  const openCropper = (file, type) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCropState({
        modalVisible: true,
        imageSrc: reader.result,
        tempFileName: file.name,
        finalFileName: "",
        finalFile: null,
        finalFilePreview: "",
        type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImage = ({ blob, fileUrl }) => {
    setCropState((prev) => {
      if (prev.type === "category") {
        setCategoryImageInfo({
          file: blob,
          fileName: prev.tempFileName,
          preview: fileUrl,
        });
      } else if (prev.type === "banner") {
        setBannerImageInfo({
          file: blob,
          fileName: prev.tempFileName,
          preview: fileUrl,
        });
      }

      return {
        modalVisible: false,
        imageSrc: null,
        tempFileName: "",
        type: "",
      };
    });
  };
  const handleClose = () => {
    setOpenDialog(false);
    form.resetFields();
    setInitialData({});
    setCategoryImageInfo({ file: null, fileName: "", preview: "" });
    setBannerImageInfo({ file: null, fileName: "", preview: "" });
  };

  return (
    <Modal
      open={open}
      onClose
      footer={null}
      centered
      maskClosable={false}
      onCancel={handleClose}
      width={1000}
    >
      <h2 className="text-2xl font-bold text-[#006666]">
        {isEditMode ? "Update" : "Create"} Category
      </h2>
      {categotyloading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleProfileSave}
            requiredMark={false}
            className="mt-4"
          >
            <Space
              className="mb-4 w-full justify-between"
              direction="horizontal"
            >
              {isEditMode && (
                <>
                  <div className="flex flex-col items-center gap-2">
                    <Avatar
                      size={64}
                      src={
                        categoryImageInfo.preview
                          ? categoryImageInfo.preview
                          : initialData.category_image
                          ? initialData.category_image.startsWith("data:image")
                            ? initialData.category_image
                            : `${imageBaseUrl}${
                                initialData.category_image
                              }?v=${Math.random()}`
                          : noImageUrl
                      }
                      icon={<UserOutlined />}
                    />

                    <Upload
                      showUploadList={false}
                      accept="image/*"
                      beforeUpload={(file) => {
                        openCropper(file, "category");
                        const reader = new FileReader();
                        reader.readAsDataURL(file);
                        return false;
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Upload Avatar</Button>
                    </Upload>
                  </div>
                  <Form.Item
                    label="Active"
                    name="is_active"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </>
              )}
            </Space>

            <div
              className={`grid grid-cols-1 ${
                isEditMode ? "grid-cols-3" : "grid-cols-4"
              } gap-4`}
            >
              <Form.Item
                label={
                  <span>
                    Category Name <span className="text-red-500">*</span>
                  </span>
                }
                name="category_name"
                rules={[{ required: true, message: "Name is required" }]}
              >
                <Input maxLength={50} autoFocus />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    Sort Order <span className="text-red-500">*</span>
                  </span>
                }
                name="category_sort_order"
                rules={[
                  {
                    required: true,
                    message: "Sort Order is required",
                  },
                  {
                    pattern: /^\d+(\.\d{1,2})?$/,
                    message: "Enter a number (e.g. 34 or 34.56)",
                  },
                ]}
              >
                <Input maxLength={2} />
              </Form.Item>
              {!isEditMode && (
                <Form.Item
                  label={
                    <span>
                      Category Image<span className="text-red-500">*</span>
                    </span>
                  }
                  name="category_image"
                  rules={[{ required: true, message: "Image is required" }]}
                >
                  <Upload
                    showUploadList={false}
                    accept="image/*"
                    beforeUpload={(file) => {
                      openCropper(file, "category");
                      form.setFieldsValue({
                        category_image: file.name,
                      });
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      return false;
                    }}
                  >
                    <Button icon={<UploadOutlined />}>
                      Upload Category Image
                    </Button>
                  </Upload>
                  {categoryImageInfo.fileName && (
                    <div className="mt-2 text-sm text-gray-600 overflow-hidden">
                      Selected Image:{" "}
                      <strong>
                        {categoryImageInfo.fileName.length > 15
                          ? `${categoryImageInfo.fileName.slice(0, 15)}...`
                          : categoryImageInfo.fileName}
                      </strong>
                    </div>
                  )}
                </Form.Item>
              )}
              <Form.Item
                label={<span>Banner Image</span>}
                name="category_banner_image"
              >
                <Upload
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={(file) => {
                    // setCategoryBannerFile(file);
                    openCropper(file, "banner");

                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>Upload Banner Image</Button>
                </Upload>

                {bannerImageInfo.fileName && (
                  <div className="mt-2 text-sm text-gray-600 overflow-hidden">
                    Selected Image:{" "}
                    <strong>
                      {bannerImageInfo.fileName.length > 15
                        ? `${bannerImageInfo.fileName.slice(0, 15)}...`
                        : bannerImageInfo.fileName}
                    </strong>
                  </div>
                )}
              </Form.Item>
            </div>
            <Form.Item
              label={
                <span>
                  Description <span className="text-red-500">*</span>
                </span>
              }
              name="category_description"
              rules={[{ required: true, message: "Description is required" }]}
            >
              <Input.TextArea rows={3} type="email" />
            </Form.Item>
            <div className=" mt-6">
              <Form.Item className="text-center mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitloading}
                  style={{ marginRight: 8 }}
                >
                  {isEditMode ? "Update" : "Submit"}
                </Button>
                <Button danger type="default" onClick={handleClose}>
                  Cancel
                </Button>
              </Form.Item>
            </div>
          </Form>
        </Card>
      )}
      <CropImageModal
        open={cropState.modalVisible}
        imageSrc={cropState.imageSrc}
        onCancel={() =>
          setCropState((prev) => ({ ...prev, modalVisible: false }))
        }
        onCropComplete={handleCroppedImage}
        maxCropSize={{ width: 400, height: 400 }}
        title={`Crop ${
          cropState.type === "banner" ? "Banner" : "Category"
        } Image`}
        cropstucture={true}
      />
    </Modal>
  );
};

export default CategoryForm;
