import {
  ArrowLeftOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Select,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ADDRESS_BY_ID,
  CUSTOMER_LIST,
  DELETE_SUB_LIST,
  FETCH_PRODUCTLIST,
  GUEST_USER_ORDER_BY_ID,
  ORDER_LIST,
  ORDER_STATUS,
} from "../../api";
import usetoken from "../../api/usetoken";
import { useApiMutation } from "../../hooks/useApiMutation";
import CardHeader from "../../components/common/CardHeader";
const OrderForm = () => {
  const { message } = App.useApp();
  const token = usetoken();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { trigger: FetchTrigger, loading: fetchloading } = useApiMutation();
  const { trigger: SubmitTrigger, loading: submitloading } = useApiMutation();
  const { trigger: DeleteTrigger, loading: deleteloading } = useApiMutation();

  const [form] = Form.useForm();
  const [addressData, setAddressData] = useState([]);
  const navigate = useNavigate();
  const [ProductData, setProductData] = useState([]);
  const [UserData, setUserData] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [ordersstatus, setOrdersSatus] = useState([]);

  const [ProductForms, setProductForms] = useState([
    {
      id: "",
      product_id: "",
      product_qnty: "",
      order_sub_status: false,
    },
  ]);
  const fetchProductData = async () => {
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

  const fetchuserData = async () => {
    try {
      const productRes = await FetchTrigger({
        url: CUSTOMER_LIST,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (productRes?.data) {
        setUserData(productRes.data);
      }
    } catch (err) {
      console.error("Error fetching product data:", err);
    }
  };
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
  useEffect(() => {
    fetchProductData();
    fetchuserData();
    fetchOrderStatus();
  }, []);

  const fetchOrder = async () => {
    const res = await FetchTrigger({
      url: `${ORDER_LIST}/${id}`,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res || !res.data) return;
    const guestUser = res.data;
    const order = res.data ?? {};
    const orderSubs = res?.data?.subs ?? [];
    setOrderData(order);
    if (guestUser?.user_id) {
      await handleUserChange(guestUser?.user_id);
    }

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
      order_date: guestUser.order_date ? dayjs(order.order_date) : null,
      user_id: guestUser.user_id || "",
      delivery_address_id: guestUser?.delivery_address_id || "",
      delivery_instructions: guestUser.delivery_instructions || "",
      order_status: guestUser.order_status || false,
      delivery_charges: guestUser.delivery_charges
        ? parseFloat(guestUser.delivery_charges)
        : 0,
      discount_amount: guestUser.discount_amount
        ? parseFloat(guestUser.discount_amount)
        : 0,

      subs: processedSubs,
    });

    setProductForms(processedSubs);
  };

  useEffect(() => {
    if (isEditMode) fetchOrder();
  }, [id]);

  const handleUserChange = async (userId) => {
    form.setFieldsValue({ delivery_address_id: undefined });
    if (!userId) {
      setAddressData([]);
      return;
    }

    try {
      const res = await FetchTrigger({
        url: `${ADDRESS_BY_ID}/${userId}`,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res?.data) {
        setAddressData(res.data);
      }
      if (isEditMode) {
        const matchedAddress = res.data.find(
          (addr) => addr.id == orderData?.delivery_address_id
        );

        if (matchedAddress) {
          form.setFieldsValue({
            delivery_address_id: matchedAddress.id,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch address data:", err);
      message.error(err.message || "Failed to load address.");
      setAddressData([]);
    }
  };

  const addRow = () => {
    setProductForms((prev) => [
      ...prev,
      {
        id: "",
        product_id: "",
        product_qnty: "",
        order_sub_status: "",
      },
    ]);
  };

  const handleSubmit = async (values) => {
    const subs = ProductForms || [];
    let hasValidSub = false;
    let hasInvalidSub = false;
    subs.forEach((sub) => {
      const { product_id, product_qnty } = sub;

      const isFilled =
        product_id?.toString().trim() && product_qnty?.toString().trim();

      const isEmpty =
        !product_id?.toString().trim() && product_qnty?.toString().trim();

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
        order_date: values.order_date
          ? dayjs(values.order_date).format("YYYY-MM-DD")
          : "",
        user_id: values.user_id || "",
        delivery_address_id: values.delivery_address_id || "",
        delivery_instructions: values.delivery_instructions || "",
        delivery_charges: values.delivery_charges || "",
        discount_amount: values.discount_amount || "",
        subs: subs.map((item) => {
          const subItem = {
            id: item.id,
            product_id: item.product_id,
            product_qnty: Number(item.product_qnty),
          };

          if (isEditMode) {
            subItem.order_sub_status = item.order_sub_status;
          }

          return subItem;
        }),
      };

      if (isEditMode) {
        payload.order_status = values.order_status;
      }
console.log(payload,"payload")
      const res = await SubmitTrigger({
        url: isEditMode ? `${ORDER_LIST}/${id}` : ORDER_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.code == 201) {
        message.success(
          res.message ||
            `Order ${isEditMode ? "updated" : "created"} successfully!`
        );
        navigate("/order");
      } else {
        message.error(res.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      message.error(
        err.response.data.message ||
          `Failed to ${isEditMode ? "update" : "create"} order.`
      );
    }
  };
  const handleProductChange = (index, field, value) => {
    const updatedForms = [...ProductForms];
    updatedForms[index][field] = value;

    setProductForms(updatedForms);
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
          fetchOrder();
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
        <>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="mt-4"
          >
            <Card
              title={
                <CardHeader title={`${isEditMode ? "Edit" : "Create"} Order`} />
              }
              extra={
                <>
                  {isEditMode && (
                    <Form.Item
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
                  )}
                </>
              }
            >
              <div
                className={
                  "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
                }
              >
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
                >
                  <DatePicker
                    format="DD-MM-YYYY"
                    className="w-full"
                    autoFocus
                  />
                </Form.Item>

                {/* User */}
                <Form.Item
                  name="user_id"
                  label={
                    <span>
                      User <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: "Please select a User" }]}
                >
                  <Select
                    placeholder="Select User"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option?.children
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={handleUserChange}
                  >
                    {UserData.map((cat) => (
                      <Select.Option key={cat.id} value={cat.id}>
                        {cat.firm_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Address */}
                <Form.Item
                  name="delivery_address_id"
                  label={
                    <span>
                      Address <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[
                    { required: true, message: "Please select an address" },
                  ]}
                >
                  <Select
                    placeholder="Select Address"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option?.children
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {addressData.map((addr) => (
                      <Select.Option key={addr.id} value={addr.id}>
                        {addr.address_type} - {addr.address}
                      </Select.Option>
                    ))}
                  </Select>
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
              </div>
              <Card
                title={<strong>Order</strong>}
                style={{ marginBottom: 6 }}
                extra={
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addRow}
                  >
                    Add Order
                  </Button>
                }
              >
                {ProductForms.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-10 gap-4 mb-4">
                    <div className="col-span-1 flex justify-center items-center font-semibold">
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
                      name={["subs", idx, "product_qnty"]}
                      label="Quantity"
                      className={`${isEditMode ? "col-span-2" : "col-span-4"}`}
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
                          handleProductChange(
                            idx,
                            "product_qnty",
                            e.target.value
                          )
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

                    <div className="col-span-1 flex justify-center items-center h-full">
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

              <Form.Item
                label="Delivery Instruction"
                name="delivery_instructions"
                className="col-span-1 md:col-span-5"
              >
                <Input.TextArea rows={3} maxLength={200} />
              </Form.Item>
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
            </Card>
          </Form>
        </>
      )}
    </>
  );
};

export default OrderForm;
