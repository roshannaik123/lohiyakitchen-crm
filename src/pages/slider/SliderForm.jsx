import { UploadOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Form,
  Image,
  Input,
  Modal,
  Skeleton,
  Space,
  Spin,
  Switch,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import { SLIDER_LIST } from "../../api";
import usetoken from "../../api/usetoken";
import CropImageModal from "../../components/common/CropImageModal";
import { useApiMutation } from "../../hooks/useApiMutation";

const SliderForm = ({ open, setOpenDialog, userId, fetchUser }) => {
  const { message } = App.useApp();
  const isEditMode = userId ? true : false;
  const [sliderImageData, setSliderImageData] = useState({
    cropModalVisible: false,
    file: null,
    preview: null,
    imageSrc: null,
    tempFileName: "",
    fileName: "",
  });

  const [form] = Form.useForm();
  const token = usetoken();
  const [initialData, setInitialData] = useState({});
  const { trigger: FetchTrigger, loading: fetchloading } = useApiMutation();
  const { trigger: SubmitTrigger, loading: submitloading } = useApiMutation();
  const [noImageUrl, setNoImageUrl] = useState("");
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const fetchSlider = async () => {
    try {
      const res = await FetchTrigger({
        url: `${SLIDER_LIST}/${userId}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res || !res.data) return;

      const userData = res.data;
      setInitialData(userData);
      form.setFieldsValue({
        slider_sort: userData.slider_sort,
        slider_url: userData.slider_url,
        is_active: userData.is_active === "true" || userData.is_active === true,
      });

      const userImage = res.image_url?.find((i) => i.image_for === "Slider");
      const noImage = res.image_url?.find((i) => i.image_for === "No Image");

      setImageBaseUrl(userImage?.image_url || "");
      setNoImageUrl(noImage?.image_url || "");
    } catch (err) {
      console.error("Error fetching slider data:", err);
      message.error("Failed to load slider data.");
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchSlider();
    } else {
      form.resetFields();
      setInitialData({});
      setSliderImageData({
        cropModalVisible: false,
        file: null,
        preview: null,
        imageSrc: null,
      });
    }
  }, [userId]);
  const handleProfileSave = async (values) => {
    try {
      const formData = new FormData();
      formData.append("slider_sort", values.slider_sort || "");
      formData.append("slider_url", values.slider_url || "");

      if (sliderImageData?.file) {
        formData.append("slider_image", sliderImageData?.file);
      }

      if (isEditMode) {
        formData.append("is_active", values.is_active);
      }
      const respose = await SubmitTrigger({
        url: isEditMode ? `${SLIDER_LIST}/${userId}?_method=PUT` : SLIDER_LIST,
        method: "post",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (respose.code === 201) {
        message.success(respose.message || "Slider updated successfully!");
        setOpenDialog(false);
        fetchUser();
      }
    } catch (err) {
      console.error("Error updating Slider:", err);
      message.error(err || "Failed to update Slider.");
    }
  };

  const handleCroppedImage = ({ blob, fileUrl }) => {
    if (!blob) return;

    setSliderImageData((prev) => ({
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
    setSliderImageData({ file: null, fileName: "", preview: "" });
  };
  return (
    <Modal
      open={open}
      onClose
      //   closable={false}
      footer={null}
      centered
      maskClosable={false}
      onCancel={handleClose}
      width={800}
    >
      <h2 className="text-2xl font-bold text-[#006666]">
        {isEditMode ? "Update" : "Create"} Slider
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
            <div className="mb-4 flex w-full justify-between shadow-md rounded-md border border-lime-300">
              {isEditMode && (
                <div className="flex flex-col gap-2 w-full">
                  <div className="relative w-full h-[200px] rounded-md overflow-hidden">
                    <Image
                      src={
                        sliderImageData.preview ||
                        (initialData.slider_image
                          ? initialData.slider_image.startsWith("data:image")
                            ? initialData.slider_image
                            : `${imageBaseUrl}${
                                initialData.slider_image
                              }?v=${Math.random()}`
                          : noImageUrl)
                      }
                      alt="Slider"
                      className="w-full h-full object-cover"
                      wrapperClassName="w-full h-full"
                      placeholder={
                        <Skeleton.Image
                          active
                          className="!w-full !h-full !flex !items-center !justify-center rounded-lg"
                        />
                      }
                    />

                    <div className="absolute top-2 right-2 bg-white/70 p-1 rounded">
                      <Form.Item
                        name="is_active"
                        valuePropName="checked"
                        noStyle
                      >
                        <Switch />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                label={
                  <span>
                    Sort Order <span className="text-red-500">*</span>
                  </span>
                }
                name="slider_sort"
                rules={[
                  { required: true, message: "Sort Order is required" },
                  {
                    pattern: /^\d+$/,
                    message: "Enter a valid number (e.g. 23)",
                  },
                ]}
              >
                <Input
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
                      /^[0-9]$/.test(e.key)
                    ) {
                      return;
                    }

                    e.preventDefault();
                  }}
                  maxLength={4}
                  autoFocus
                />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    Image <span className="text-red-500">*</span>
                  </span>
                }
              >
                <Upload
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={(file) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setSliderImageData((prev) => ({
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
                  <Button icon={<UploadOutlined />} className="w-[215px]">
                    Upload Image
                  </Button>
                </Upload>

                {sliderImageData.file && (
                  <div className="mt-2 text-sm text-gray-600 overflow-hidden">
                    Selected file:{" "}
                    <strong>
                      {sliderImageData.fileName.length > 15
                        ? `${sliderImageData.fileName.slice(0, 15)}...`
                        : sliderImageData.fileName}
                    </strong>
                  </div>
                )}
              </Form.Item>

              <Form.Item label={<span>Url</span>} name="slider_url">
                <Input maxLength={60} />
              </Form.Item>
            </div>

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
        open={sliderImageData.cropModalVisible}
        imageSrc={sliderImageData.imageSrc}
        onCancel={() =>
          setSliderImageData((prev) => ({ ...prev, cropModalVisible: false }))
        }
        onCropComplete={handleCroppedImage}
        maxCropSize={{ width: 800, height: 400 }}
        title="Crop Slider Image"
        cropstucture={true}
      />
    </Modal>
  );
};

export default SliderForm;
