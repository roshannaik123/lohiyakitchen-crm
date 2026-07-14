import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DELETE_SUB_LIST,
  FETCH_PRODUCTLIST,
  GUEST_USER_ORDER_BY_ID,
  GUEST_USER_ORDER_CREATE,
  GUEST_USER_ORDER_UPDATE,
  ORDER_STATUS,
} from "../../api";
import usetoken from "../../api/usetoken";
import CardHeader from "../../components/common/CardHeader";
import { useApiMutation } from "../../hooks/useApiMutation";
const GuestUserOrderForm = () => {
  const { message } = App.useApp();
  const token = usetoken();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { trigger: FetchTrigger, loading: fetchloading } = useApiMutation();
  const { trigger: SubmitTrigger, loading: submitloading } = useApiMutation();
  const { trigger: DeleteTrigger, loading: deleteloading } = useApiMutation();
  const [form] = Form.useForm();
  const [ProductData, setProductData] = useState([]);
  const navigate = useNavigate();
  const [ordersstatus, setOrdersSatus] = useState([]);

  const [ProductForms, setProductForms] = useState([
    {
      id: "",
      product_id: "",
      product_price: "",
      product_qnty: "",
      order_sub_status: "",
    },
  ]);
  const fetchOrderStatus = async () => {
    const res = await FetchTrigger({
      url: `${ORDER_STATUS}`,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.code === 201) {
      const responseData = res.data;

      setOrdersSatus(responseData || []);
    }
  };

  const fetchData = async () => {
    try {
      const productRes = await FetchTrigger({
        url: FETCH_PRODUCTLIST,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (productRes?.data) {
        setProductData(productRes.data);
      }
    } catch (err) {
      console.error("Error fetching product data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchOrderStatus();
  }, []);

  const fetchGuestUserOrderData = async () => {
    const res = await FetchTrigger({
      url: `${GUEST_USER_ORDER_BY_ID}/${id}`,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res || !res.data) return;

    const guestUser = res.data?.[0] ?? {};
    const order = res.order ?? {};
    const orderSubs = res.orderSub ?? [];
    const processedSubs = Array.isArray(orderSubs)
      ? orderSubs.map((p) => ({
          id: p.id || "",
          product_id: p.product_id || "",
          product_price: parseFloat(p.product_price) || 0,
          product_qnty: parseFloat(p.product_qnty) || 0,
          order_sub_status: p.order_sub_status || false,
        }))
      : [];
    form.setFieldsValue({
      firm_name: guestUser.firm_name || "",
      gstin: guestUser.gstin || "",
      name: guestUser.name || "",
      mobile: guestUser.mobile || "",
      whatsapp: guestUser.whatsapp || "",
      email: guestUser.email || "",
      address: guestUser.address || "",
      order_date: order.order_date ? dayjs(order.order_date) : null,
      delivery_instructions: order.delivery_instructions || "",
      order_status: order.order_status || false,
      delivery_charges: order.delivery_charges
        ? parseFloat(order.delivery_charges)
        : 0,
      discount_amount: order.discount_amount
        ? parseFloat(order.discount_amount)
        : 0,
      subs: processedSubs,
    });

    setProductForms(processedSubs);
  };
  useEffect(() => {
    if (isEditMode) fetchGuestUserOrderData();
  }, [id]);

  const handleProductChange = (index, field, value) => {
    const updatedForms = [...ProductForms];
    updatedForms[index][field] = value;

    if (field === "product_id") {
      const selectedProduct = ProductData.find((prod) => prod.id === value);

      if (selectedProduct) {
        const price =
          Number(selectedProduct.product_selling_price) !== 0
            ? Number(selectedProduct.product_selling_price)
            : Number(selectedProduct.product_spl_offer_price) !== 0
            ? Number(selectedProduct.product_spl_offer_price)
            : Number(selectedProduct.product_mrp);

        updatedForms[index].product_price = price;

        form.setFieldsValue({
          subs: {
            [index]: {
              product_price: price,
            },
          },
        });
      }
    }

    setProductForms(updatedForms);
  };

  const addRow = () => {
    setProductForms((prev) => [
      ...prev,
      {
        id: "",
        product_id: "",
        product_price: "",
        product_qnty: "",
        ...(isEditMode && { order_sub_status: "pending" }),
      },
    ]);
  };

  const handleSubmit = async (values) => {
    const subs = ProductForms || [];
    let hasValidSub = false;
    let hasInvalidSub = false;

    subs.forEach((sub) => {
      const { product_id, product_price, product_qnty } = sub;

      const isFilled =
        product_id?.toString().trim() &&
        product_price?.toString().trim() &&
        product_qnty?.toString().trim();

      const isEmpty =
        !product_id?.toString().trim() &&
        !product_price?.toString().trim() &&
        !product_qnty?.toString().trim();

      if (isFilled) {
        hasValidSub = true;
      } else if (!isEmpty) {
        hasInvalidSub = true;
      }
    });

    if (!hasValidSub) {
      message.error("At least one valid product row is required.");
      return;
    }

    if (hasInvalidSub) {
      message.error(
        "Some product rows are partially filled. Please complete or remove them."
      );
      return;
    }

    try {
      const payload = {
        address: values.address || "",
        order_date: values.order_date
          ? dayjs(values.order_date).format("YYYY-MM-DD")
          : "",
        delivery_instructions: values.delivery_instructions || "",
        delivery_charges: values.delivery_charges || "",
        discount_amount: values.discount_amount || "",
        subs: (form.getFieldValue("subs") || []).map((item) => {
          const sub = {
            product_id: item.product_id,
            product_price: Number(item.product_price),
            product_qnty: Number(item.product_qnty),
          };

          if (item.id) {
            sub.id = item.id;
          }

          if (isEditMode) {
            sub.order_sub_status = item.order_sub_status;
          }

          return sub;
        }),
      };

      if (!isEditMode) {
        payload.firm_name = values.firm_name || "";
        payload.gstin = values.gstin || "";
        payload.name = values.name || "";
        payload.email = values.email || "";
        payload.mobile = values.mobile || "";
      }

      if (isEditMode) {
        payload.order_status = values.order_status;
      }

      const res = await SubmitTrigger({
        url: isEditMode
          ? `${GUEST_USER_ORDER_UPDATE}/${id}`
          : GUEST_USER_ORDER_CREATE,
        method: `${isEditMode ? "put" : "post"}`,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.code == 201) {
        message.success(
          res.message ||
            `User ${isEditMode ? "updated" : "created"} successfully!`
        );
        navigate("/guest-user-order");
      } else {
        message.error(res.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      message.error(`Failed to ${isEditMode ? "update" : "create"} user.`);
    }
  };

  const handleDelete = async (id, index) => {
    try {
      if (id) {
        const res = await DeleteTrigger({
          url: `${DELETE_SUB_LIST}/${id}`,
          method: "delete",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.code == 201) {
          setProductForms((prev) => prev.filter((_, i) => i !== index));
          message.success(res.message || "Product removed successfully");
          fetchGuestUserOrderData();
        }
      }
    } catch (error) {
      console.error("Delete failed", error);
      message.error(error.message || "Failed to delete product");
    }
  };

  return (
    <>
      {fetchloading || deleteloading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <Card
          title={
            <CardHeader
              title={`${isEditMode ? "Edit" : "Create"} Guest Order`}
            />
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="mt-4"
          >
            <div
              className={`grid ${
                isEditMode
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-1"
              } gap-2`}
            >
              {isEditMode && (
                <Card
                  style={{ marginBottom: 6 }}
                  styles={{ body: { padding: 6 } }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {[
                      {
                        label: "Firm Name",
                        value: form.getFieldValue("firm_name"),
                      },
                      { label: "GSTIN", value: form.getFieldValue("gstin") },
                      { label: "Name", value: form.getFieldValue("name") },
                      { label: "Email", value: form.getFieldValue("email") },
                      { label: "Mobile", value: form.getFieldValue("mobile") },
                      {
                        label: "WhatsApp",
                        value: form.getFieldValue("whatsapp"),
                      },
                    ].map(({ label, value }, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-gray-500">{label}: </span>
                        <span className="text-gray-800 font-medium">
                          {value || <span className="text-gray-400">-</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              <Card
                style={{ marginBottom: 6 }}
                styles={{ body: { padding: 6 } }}
              >
                <div
                  className={`grid gap-2 ${
                    isEditMode
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1 md:grid-cols-3"
                  }`}
                >
                  {" "}
                  {!isEditMode && (
                    <>
                      <Form.Item
                        label="Firm Name"
                        name="firm_name"
                        style={{ marginBottom: "0px" }}
                      >
                        <Input maxLength={200} autoFocus={!isEditMode} />
                      </Form.Item>
                      <Form.Item
                        label="GSTIN"
                        name="gstin"
                        style={{ marginBottom: "0px" }}
                      >
                        <Input maxLength={15} />
                      </Form.Item>
                      <Form.Item
                        label={
                          <span>
                            Name <span className="text-red-500">*</span>
                          </span>
                        }
                        name="name"
                        rules={[
                          { required: true, message: "Name is required" },
                        ]}
                        style={{ marginBottom: "0px" }}
                      >
                        <Input maxLength={100} />
                      </Form.Item>
                      <Form.Item
                        label={
                          <span>
                            Email <span className="text-red-500">*</span>
                          </span>
                        }
                        name="email"
                        rules={[
                          { required: true, message: "Email is required" },
                        ]}
                        style={{ marginBottom: "0px" }}
                      >
                        <Input type="email" maxLength={200} />
                      </Form.Item>
                      <Form.Item
                        name="mobile"
                        label={
                          <span>
                            Mobile <span className="text-red-500">*</span>
                          </span>
                        }
                        rules={[
                          { required: true, message: "Mobile is required" },
                          {
                            pattern: /^[0-9]{10}$/,
                            message: "Enter a valid 10-digit mobile number",
                          },
                        ]}
                        style={{ marginBottom: "0px" }}
                      >
                        <Input maxLength={10} />
                      </Form.Item>
                      <Form.Item
                        label="WhatsApp"
                        name="whatsapp"
                        rules={[
                          {
                            pattern: /^[0-9]{10}$/,
                            message: "Enter a valid 10-digit whatsaap number",
                          },
                        ]}
                        style={{ marginBottom: "0px" }}
                      >
                        <Input maxLength={10} />
                      </Form.Item>
                    </>
                  )}
                  <Form.Item
                    label={
                      <span>
                        Order Date <span className="text-red-500">*</span>
                      </span>
                    }
                    name="order_date"
                    rules={[
                      { required: true, message: "Please select order date" },
                    ]}
                    style={{ marginBottom: "0px" }}
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      className="w-full"
                      autoFocus={isEditMode}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Delivery Charge"
                    name="delivery_charges"
                    rules={[
                      {
                        pattern: /^\d*\.?\d{0,2}$/,
                        message: "Enter a valid charge (e.g. 23.5)",
                      },
                    ]}
                    style={{ marginBottom: "0px" }}
                  >
                    <Input
                      onKeyDown={(e) => {
                        const allowedKeys = [
                          "Backspace",
                          "Tab",
                          "ArrowLeft",
                          "ArrowRight",
                          "Delete",
                          ".",
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
                      maxLength={8}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Discount Amount"
                    name="discount_amount"
                    rules={[
                      {
                        pattern: /^\d*\.?\d{0,2}$/,
                        message: "Enter a valid amount (e.g. 23.5)",
                      },
                    ]}
                    style={{ marginBottom: "0px" }}
                  >
                    <Input
                      onKeyDown={(e) => {
                        const allowedKeys = [
                          "Backspace",
                          "Tab",
                          "ArrowLeft",
                          "ArrowRight",
                          "Delete",
                          ".",
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
                      maxLength={8}
                    />
                  </Form.Item>
                  <Form.Item
                    label="Status"
                    name="order_status"
                    style={{ marginBottom: "0px" }}
                  >
                    <Select placeholder="Select Status" allowClear>
                      {ordersstatus.map((status) => (
                        <Option key={status.id} value={status.status}>
                          <span className="capitalize">{status.status}</span>{" "}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </Card>
            </div>
            <Card
              title={<strong>Product</strong>}
              style={{ marginBottom: 16 }}
              extra={
                <Button type="dashed" icon={<PlusOutlined />} onClick={addRow}>
                  Add Product
                </Button>
              }
            >
              {ProductForms.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 mb-4">
                  <div className="col-span-1 flex justify-start items-center font-semibold">
                    {idx + 1}.
                  </div>

                  <Form.Item
                    name={["subs", idx, "product_id"]}
                    label={
                      <span>
                        Product <span className="text-red-500">*</span>
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please select a product" },
                    ]}
                    className={`${isEditMode ? "col-span-3" : "col-span-4"}`}
                  >
                    <Select
                      placeholder="Select Product"
                      allowClear
                      showSearch
                      value={item.product_id}
                      filterOption={(input, option) =>
                        option?.children
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onChange={(value) =>
                        handleProductChange(idx, "product_id", value)
                      }
                    >
                      {ProductData.map((cat) => (
                        <Select.Option key={cat.id} value={cat.id}>
                          {cat.product_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name={["subs", idx, "product_price"]}
                    label="Product Price"
                    className={`${isEditMode ? "col-span-2" : "col-span-3"}`}
                    rules={[
                      {
                        pattern: /^\d*\.?\d{0,2}$/,
                        message: "Enter a valid price (e.g. 23.5)",
                      },
                    ]}
                  >
                    <Input
                      maxLength={6}
                      value={item.product_price}
                      onChange={(e) =>
                        handleProductChange(
                          idx,
                          "product_price",
                          e.target.value
                        )
                      }
                    />
                  </Form.Item>

                  <Form.Item
                    name={["subs", idx, "product_qnty"]}
                    label="Quantity"
                    className={`${isEditMode ? "col-span-2" : "col-span-3"}`}
                    rules={[
                      {
                        pattern: /^\d*\.?\d{0,2}$/,
                        message: "Enter a valid quantity (e.g. 23.5)",
                      },
                    ]}
                  >
                    <Input
                      maxLength={4}
                      value={item.product_qnty}
                      onChange={(e) =>
                        handleProductChange(idx, "product_qnty", e.target.value)
                      }
                    />
                  </Form.Item>

                  {isEditMode && (
                    <Form.Item
                      name={["subs", idx, "order_sub_status"]}
                      label="Status"
                      className="col-span-3"
                    >
                      <Select
                        placeholder="Select Status"
                        value={item.order_sub_status}
                        onChange={(value) =>
                          handleProductChange(idx, "order_sub_status", value)
                        }
                      >
                        <Select.Option value="pending">Pending</Select.Option>
                        <Select.Option value="completed">
                          Completed
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  )}

                  <div className="col-span-1 flex justify-end items-center h-full">
                    {item.id ? (
                      <Popconfirm
                        title="Are you sure to delete this product?"
                        onConfirm={() => handleDelete(item.id, idx)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          disabled={ProductForms.length === 1}
                        />
                      </Popconfirm>
                    ) : (
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() => {
                          setProductForms((prev) => {
                            const updated = [...prev];
                            updated.splice(idx, 1);
                            return updated;
                          });
                        }}
                        disabled={ProductForms.length === 1}
                      />
                    )}
                  </div>
                </div>
              ))}
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Delivery Instruction"
                name="delivery_instructions"
              >
                <Input.TextArea rows={3} maxLength={200} />
              </Form.Item>
              <Form.Item label="Address" name="address">
                <Input.TextArea rows={3} maxLength={200} />
              </Form.Item>
            </div>
            <div className=" mt-6">
              <Form.Item className="text-center">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitloading}
                  style={{ marginRight: 8 }}
                >
                  {isEditMode ? "Update" : "Submit"}
                </Button>

                <Button danger type="default" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </Form.Item>
            </div>
          </Form>
        </Card>
      )}
    </>
  );
};

export default GuestUserOrderForm;
