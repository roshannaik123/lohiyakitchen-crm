import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons";
import { App, Button, Card, DatePicker, Form, Input, Select, Spin, Row, Col, Divider, Checkbox, InputNumber } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ADDRESS_BY_ID,
  CUSTOMER_LIST,
  FETCH_PRODUCTLIST,
  GUEST_USER_ORDER_BY_ID,
  ORDER_LIST,
  ORDER_STATUS,
} from "../../api";
import usetoken from "../../api/usetoken";
import { useApiMutation } from "../../hooks/useApiMutation";

const { Option } = Select;

const Pos = () => {
  const { message } = App.useApp();
  const token = usetoken();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { trigger: FetchTrigger, loading: fetchloading } = useApiMutation();
  const { trigger: SubmitTrigger, loading: submitloading } = useApiMutation();
  const [form] = Form.useForm();
  const [addressData, setAddressData] = useState([]);
  const navigate = useNavigate();
  const [ProductData, setProductData] = useState([]);
  const [UserData, setUserData] = useState([]);
  const [orderData, setOrderData] = useState(null);
  const [ordersstatus, setOrdersSatus] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

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
      url: `${GUEST_USER_ORDER_BY_ID}/${id}`,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res || !res.data) return;

    const guestUser = res.data?.[0] ?? {};
    const order = res.order ?? {};
    const orderSubs = res.orderSub ?? [];
    setOrderData(order);
    
    if (order?.user_id) {
      await handleUserChange(order?.user_id);
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
      firm_name: guestUser.firm_name || "",
      gstin: guestUser.gstin || "",
      name: guestUser.name || "",
      mobile: guestUser.mobile || "",
      whatsapp: guestUser.whatsapp || "",
      email: guestUser.email || "",
      address: guestUser.address || "",
      order_date: order.order_date ? dayjs(order.order_date) : null,
      user_id: order.user_id || "",
      delivery_address_id: order?.delivery_address_id || "",
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

    setSelectedProducts(processedSubs);
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
      message.error("Failed to load address.");
      setAddressData([]);
    }
  };

  const handleProductSelect = (product) => {
    const existingProductIndex = selectedProducts.findIndex(
      (p) => p.product_id === product.id
    );

    if (existingProductIndex >= 0) {
      // Product already exists, increase quantity by 1
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex].product_qnty += 1;
      setSelectedProducts(updatedProducts);
    } else {
      // Add new product with quantity 1
      setSelectedProducts([
        ...selectedProducts,
        {
          id: "",
          product_id: product.id,
          product_name: product.product_name,
          product_price: product.product_selling_price,
          product_qnty: 1,
          order_sub_status: false,
        },
      ]);
    }
  };

  const handleQuantityChange = (index, value) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].product_qnty = value;
    setSelectedProducts(updatedProducts);
  };

  const removeProduct = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  const filteredProducts = ProductData.filter((product) =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateSubtotal = () => {
    return selectedProducts.reduce(
      (total, product) => total + (product.product_price * product.product_qnty),
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryCharges = form.getFieldValue("delivery_charges") || 0;
    const discountAmount = form.getFieldValue("discount_amount") || 0;
    return subtotal + parseFloat(deliveryCharges) - parseFloat(discountAmount);
  };

  const handleSubmit = async (values) => {
    if (selectedProducts.length === 0) {
      message.error("Please add at least one product to the order.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append(
        "order_date",
        values.order_date ? dayjs(values.order_date).format("YYYY-MM-DD") : ""
      );

      formData.append("user_id", values.user_id || "");
      formData.append("delivery_address_id", values.delivery_address_id || "");
      formData.append(
        "delivery_instructions",
        values.delivery_instructions || ""
      );
      formData.append("delivery_charges", values.delivery_charges || "");
      formData.append("discount_amount", values.discount_amount || "");

      if (isEditMode) {
        formData.append("order_status", values.order_status);
      }

      selectedProducts.forEach((item, index) => {
        formData.append(`subs[${index}][id]`, item.id);
        formData.append(`subs[${index}][product_id]`, item.product_id);
        formData.append(
          `subs[${index}][product_qnty]`,
          Number(item.product_qnty)
        );

        if (isEditMode) {
          formData.append(
            `subs[${index}][order_sub_status]`,
            item.order_sub_status
          );
        }
      });

      const res = await SubmitTrigger({
        url: isEditMode ? `${ORDER_LIST}/${id}` : ORDER_LIST,
        method: isEditMode ? "put" : "post",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
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
      message.error(`Failed to ${isEditMode ? "update" : "create"} order.`);
    }
  };

  return (
    <>
      {fetchloading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="bg-[#e6f2f2] rounded-full p-2 cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftOutlined style={{ color: "#006666" }} />
            </div>
            <h2 className="text-2xl font-bold text-[#006666] mb-0">
              {isEditMode ? "Edit" : "Create"} Order
            </h2>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Row gutter={16}>
              {/* Products Panel */}
              <Col xs={24} md={12} lg={14}>
                <Card
                  title="Products"
                  extra={
                    <Input
                      placeholder="Search products..."
                      prefix={<SearchOutlined />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      allowClear
                    />
                  }
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border rounded p-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="font-medium truncate">{product.product_name}</div>
                        <div className="text-sm text-gray-600">
                          ₹{product.product_selling_price}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>

              {/* Billing Panel */}
              <Col xs={24} md={12} lg={10}>
                <Card title="Order Details">
                  <div className="space-y-4">
                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name="order_date"
                        label="Order Date"
                        rules={[
                          { required: true, message: "Please select order date" },
                        ]}
                      >
                        <DatePicker format="DD-MM-YYYY" className="w-full" />
                      </Form.Item>

                      <Form.Item
                        name="user_id"
                        label="Customer"
                        rules={[{ required: true, message: "Please select a User" }]}
                      >
                        <Select
                          placeholder="Select Customer"
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

                      <Form.Item
                        name="delivery_address_id"
                        label="Delivery Address"
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

                      {isEditMode && (
                        <Form.Item name="order_status" label="Status">
                          <Select placeholder="Select Status" allowClear>
                            {ordersstatus.map((status) => (
                              <Option key={status.id} value={status.status}>
                                <span className="capitalize">{status.status}</span>
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      )}
                    </div>

                    <Form.Item
                      name="delivery_instructions"
                      label="Delivery Instructions"
                    >
                      <Input.TextArea rows={2} maxLength={200} />
                    </Form.Item>

                    {/* Order Items */}
                    <Divider orientation="left">Order Items</Divider>
                    {selectedProducts.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        <ShoppingCartOutlined className="text-2xl" />
                        <div>No products selected</div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedProducts.map((product, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between border-b pb-2"
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                {ProductData.find(p => p.id === product.product_id)?.product_name || product.product_name}
                              </div>
                              <div className="text-sm text-gray-600">
                                ₹{product.product_price} × {product.product_qnty} = ₹
                                {(product.product_price * product.product_qnty).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <InputNumber
                                min={1}
                                value={product.product_qnty}
                                onChange={(value) => handleQuantityChange(index, value)}
                                style={{ width: 70 }}
                              />
                              <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => removeProduct(index)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Order Summary */}
                    <Divider orientation="left">Order Summary</Divider>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charges:</span>
                        <Form.Item name="delivery_charges" className="mb-0">
                          <InputNumber
                            min={0}
                            step={0.01}
                            style={{ width: 100 }}
                          />
                        </Form.Item>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <Form.Item name="discount_amount" className="mb-0">
                          <InputNumber
                            min={0}
                            step={0.01}
                            style={{ width: 100 }}
                          />
                        </Form.Item>
                      </div>
                      <Divider className="my-2" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>₹{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6 text-center">
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitloading}
                        style={{ marginRight: 8 }}
                        size="large"
                        className="w-full"
                      >
                        {isEditMode ? "Update Order" : "Create Order"}
                      </Button>
                      <Button
                        danger
                        type="default"
                        onClick={() => navigate(-1)}
                        className="w-full mt-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
      )}
    </>
  );
};

export default Pos;