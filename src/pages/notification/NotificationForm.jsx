import { UploadOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Form,
  Image,
  Input,
  Modal,
  Space,
  Spin,
  Switch,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import { NOTIFICATION_LIST } from "../../api";
import usetoken from "../../api/usetoken";
import CropImageModal from "../../components/common/CropImageModal";
import { useApiMutation } from "../../hooks/useApiMutation";

const NotificationForm = ({ open, setOpenDialog, userId, fetchUser }) => {
  const { message } = App.useApp();
  const isEditMode = userId ? true : false;

  const [form] = Form.useForm();
  const token = usetoken();
  const [initialData, setInitialData] = useState({});
  const { trigger: FetchTrigger, loading: fetchloading } = useApiMutation();
  const { trigger: SubmitTrigger, loading: submitloading } = useApiMutation();
  const [noImageUrl, setNoImageUrl] = useState("");
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [notificationImageData, setNotificationImageData] = useState({
    cropModalVisible: false,
    file: null,
    preview: null,
    imageSrc: null,
    tempFileName: "",
    fileName: "",
  });
  const fetchNotification = async () => {
    try {
      const res = await FetchTrigger({
        url: `${NOTIFICATION_LIST}/${userId}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res || !res.data) return;

      const userData = res.data;
      setInitialData(userData);
      form.setFieldsValue({
        notification_heading: userData.notification_heading,
        notification_description: userData.notification_description,
        is_active: userData.is_active === "true" || userData.is_active === true,
      });

      const userImage = res.image_url?.find(
        (i) => i.image_for === "Notification"
      );
      const noImage = res.image_url?.find((i) => i.image_for === "No Image");

      setImageBaseUrl(userImage?.image_url || "");
      setNoImageUrl(noImage?.image_url || "");
    } catch (err) {
      console.error("Error fetching notification data:", err);
      message.error("Failed to load notification data.");
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchNotification();
    } else {
      form.resetFields();
      setInitialData({});

      setNotificationImageData({
        cropModalVisible: false,
        file: null,
        preview: null,
      });
    }
  }, [userId]);
  const handleProfileSave = async (values) => {
    try {
      const formData = new FormData();
      formData.append(
        "notification_heading",
        values.notification_heading || ""
      );
      formData.append(
        "notification_description",
        values.notification_description || ""
      );

      if (notificationImageData.file) {
        formData.append("notification_images", notificationImageData.file);
      }

      if (isEditMode) {
        formData.append("is_active", values.is_active);
      }
      const respose = await SubmitTrigger({
        url: isEditMode
          ? `${NOTIFICATION_LIST}/${userId}?_method=PUT`
          : NOTIFICATION_LIST,
        method: "post",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (respose.code === 201) {
        message.success(
          respose.message || "Notification updated successfully!"
        );
        setOpenDialog(false);
        fetchUser();
      }
    } catch (err) {
      console.error("Error Notification Notification:", err);
      message.error(err || "Failed to update Notification.");
    }
  };
  const handleCroppedImage = ({ blob, fileUrl }) => {
    if (!blob) return;

    setNotificationImageData((prev) => ({
      ...prev,
      file: blob,
      preview: fileUrl,
      fileName: prev.tempFileName,
      cropModalVisible: false,
    }));
  };
  const handleClose = () => {
    setOpenDialog(false);
    form.resetFields();
    setInitialData({});
    setNotificationImageData({ file: null, fileName: "", preview: "" });
  };
  return (
    <Modal
      open={open}
      onClose
      footer={null}
      centered
      maskClosable={false}
      onCancel={handleClose}
      width={800}
    >
      <h2 className="text-2xl font-bold text-[#006666]">
        {isEditMode ? "Update" : "Create"} Notification
      </h2>
      {fetchloading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleProfileSave}
            initialValues={{ is_active: false }}
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
                    <div className="relative w-full h-[200px] border rounded-md overflow-hidden">
                      <Image
                        src={
                          notificationImageData.preview ||
                          (initialData.notification_images
                            ? initialData.notification_images.startsWith(
                                "data:image"
                              )
                              ? initialData.notification_images
                              : `${imageBaseUrl}${initialData.notification_images}`
                            : noImageUrl)
                        }
                        alt="Notification"
                        className="w-full h-full object-cover"
                      />
                    </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span>
                    Heading <span className="text-red-500">*</span>
                  </span>
                }
                name="notification_heading"
                rules={[{ required: true, message: "Heading is required" }]}
              >
                <Input maxLength={100} autoFocus />
              </Form.Item>
              <Form.Item
                className="w-full"
                name="notification_images"
                label={
                  <span>
                    Image <span className="text-red-500">*</span>
                  </span>
                }
                {...(!isEditMode && {
                  rules: [{ required: true, message: "Image is required" }],
                })}
              >
                <Upload
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={(file) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setNotificationImageData((prev) => ({
                        ...prev,
                        tempFileName: file.name,
                        imageSrc: reader.result,
                        cropModalVisible: true,
                      }));
                    };
                    reader.readAsDataURL(file);
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />} className="w-[340px]">
                    Upload Image
                  </Button>
                </Upload>
                {notificationImageData.file && (
                  <div className="mt-2 text-sm text-gray-600 overflow-hidden">
                    Selected file:{" "}
                    <strong>
                      {notificationImageData.fileName.length > 15
                        ? `${notificationImageData.fileName.slice(0, 15)}...`
                        : notificationImageData.fileName}
                    </strong>
                  </div>
                )}
              </Form.Item>
            </div>

            <Form.Item
              label={<span>Description</span>}
              name="notification_description"
            >
              <Input.TextArea maxLength={250} />
            </Form.Item>
            <div className=" mt-6">
              <Form.Item className="text-center mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitloading}
                  style={{ marginRight: 8 }}
                >
                  {isEditMode ? "Update" : "Create"}
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
        open={notificationImageData.cropModalVisible}
        imageSrc={notificationImageData.imageSrc}
        onCancel={() =>
          setNotificationImageData((prev) => ({
            ...prev,
            cropModalVisible: false,
          }))
        }
        onCropComplete={handleCroppedImage}
        maxCropSize={{ width: 800, height: 400 }}
        title="Crop Notification Image"
        cropstucture={true}
      />
    </Modal>
  );
};

export default NotificationForm;
