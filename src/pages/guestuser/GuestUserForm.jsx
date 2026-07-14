// ------------------------------NOT USING--------------------------------------
import { App, Form, Input, Modal, Spin } from "antd";
import { useEffect } from "react";
import { GUEST_USER_BY_ID, UPDATE_GUEST_USER } from "../../api";
import usetoken from "../../api/usetoken";
import { useApiMutation } from "../../hooks/useApiMutation";

const GuestUserForm = ({ open, onClose, userId, onSuccess }) => {
  const token = usetoken();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const { trigger: fetchTrigger, loading: isFetching } = useApiMutation();
  const { trigger: submitTrigger, loading: isSubmitting } = useApiMutation();

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    } else {
      form.resetFields();
    }
  }, [open, userId]);

  const fetchUserDetails = async () => {
    const res = await fetchTrigger({
      url: `${GUEST_USER_BY_ID}/${userId}`,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res?.data) {
      form.setFieldsValue(res.data);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        firm_name: values.firm_name || "",
        gstin: values.gstin || "",
        name: values.name || "",
        email: values.email || "",
        mobile: values.mobile || "",
        whatsapp: values.whatsapp || "",
        address: values.address || "",
      };

      const res = await submitTrigger({
        url: `${UPDATE_GUEST_USER}/${userId}`,
        method: "put",
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.code === 201) {
        message.success(res.message || "Guest updated successfully!");
        onSuccess?.();
        onClose();
      } else {
        message.error(res.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Form error:", err);
      message.error("Failed to update guest.");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Update Guest User"
      okText="Update"
      onOk={() => form.submit()}
      confirmLoading={isSubmitting}
      width={800}
      destroyOnClose
    >
      {isFetching ? (
        <div className="flex justify-center py-12">
          <Spin />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Firm Name" name="firm_name">
              <Input />
            </Form.Item>
            <Form.Item label="GSTIN" name="gstin">
              <Input />
            </Form.Item>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Email is required" }]}
            >
              <Input type="email" />
            </Form.Item>
            <Form.Item
              label="Mobile"
              name="mobile"
              rules={[
                { required: true, message: "Mobile is required" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
            <Form.Item
              label="WhatsApp"
              name="whatsapp"
              rules={[
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit WhatsApp number",
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
            <Form.Item label="Address" name="address" className="md:col-span-2">
              <Input.TextArea rows={3} />
            </Form.Item>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default GuestUserForm;
