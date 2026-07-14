import {
  FileExcelOutlined,
  FilePdfOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Select,
  Spin,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { ORDER_PRODUCT_REPORT, ORDER_STATUS } from "../../../api";
import useToken from "../../../api/usetoken";
import { exportOrderProductExcel } from "../../../components/exportExcel/exportOrderProductExcel";
import { downloadPDF } from "../../../components/pdfExport/pdfExport";
import { useApiMutation } from "../../../hooks/useApiMutation";
import { useReactToPrint } from "react-to-print";
const OrderProductReport = () => {
  const { message } = App.useApp();
  const token = useToken();
  const [form] = Form.useForm();
  const { trigger: submitTrigger, loading: isMutating } = useApiMutation();
  const { trigger } = useApiMutation();
  const orderProductRef = useRef(null);
  const [ordersstatus, setOrdersSatus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrder, setFilteredOrder] = useState([]);
  const fetchOrderStatus = async () => {
    const res = await trigger({
      url: `${ORDER_STATUS}`,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.code === 201) {
      const responseData = res.data;

      setOrdersSatus(responseData || []);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
  }, []);
  const handleSubmit = async (values) => {
    const [from, to] = values?.date_range || [];

    const payload = {
      from_date: dayjs(from).format("YYYY-MM-DD"),
      to_date: dayjs(to).format("YYYY-MM-DD"),
    };
    try {
      const res = await submitTrigger({
        url: ORDER_PRODUCT_REPORT,
        method: "post",
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.code === 201) {
        setOrders(res.data);
        setFilteredOrder(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch order report:", error);
    }
  };
  const handleFilterChange = (value) => {
    if (value === "all") {
      setFilteredOrder(orders);
    } else {
      setFilteredOrder(orders.filter((item) => item.order_status === value));
    }
  };

   const handlePrint = useReactToPrint({
         content: () => orderProductRef.current, 
         documentTitle: "order-product-report",
         pageStyle: `
           @page {
             size: auto;
             margin: 1mm;
           }
           @media print {
             body {
               margin: 0;
               padding: 2mm;
             }
             .print-hide {
               display: none;
             }
           }
         `,
       });
  return (
    <Card
      title="Order Product Report"
      bordered={false}
      className="shadow-md rounded-lg"
      extra={
        <div className="flex  items-center gap-2">
          <Select
            defaultValue="all"
            style={{ width: 150 }}
            onChange={handleFilterChange}
          >
            <Option key="all" value="all">
              All
            </Option>
            {ordersstatus.map((status) => (
              <Option key={status.id} value={status.status}>
                {status.status}
              </Option>
            ))}
          </Select>

          <Tooltip title="Print Report">
            <Button
              type="default"
              shape="circle"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
            />
          </Tooltip>
          <Tooltip title="Download PDF">
            <Button
              type="default"
              shape="circle"
              icon={<FilePdfOutlined />}
              onClick={() =>
                downloadPDF("printable-section", "Order Product.pdf", message)
              }
            />
          </Tooltip>

          <Tooltip title="Excel Report">
            <Button
              type="default"
              shape="circle"
              icon={<FileExcelOutlined />}
              onClick={() => exportOrderProductExcel(filteredOrder)}
            />
          </Tooltip>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          date_range: [dayjs().startOf("month"), dayjs()],
        }}
        onFinish={handleSubmit}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item
            label={
              <span>
                Date <span className="text-red-500">*</span>
              </span>
            }
            name="date_range"
            rules={[{ required: true, message: "Please select a date range" }]}
          >
            <DatePicker.RangePicker
              format="DD-MM-YYYY"
              className="w-full"
              placeholder={["From Date", "To Date"]}
            />
          </Form.Item>

          <div className="flex items-end">
            <Form.Item className="w-full">
              <Button
                type="primary"
                loading={isMutating}
                htmlType="submit"
                block
              >
                Submit
              </Button>
            </Form.Item>
          </div>
        </div>
      </Form>
      <div ref={orderProductRef} id="printable-section" className="p-0 m-0 print:p-0 print:m-0">
        <h1 className="text-xl font-semibold mb-4 text-center">
          Order Product Report
        </h1>

        {isMutating ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredOrder.length > 0 ? (
          Object.entries(
            filteredOrder.reduce((acc, item) => {
              if (!acc[item.product_name]) acc[item.product_name] = [];
              acc[item.product_name].push(item);
              return acc;
            }, {})
          ).map(([productName, items]) => (
            <div key={productName} className="mb-8">
              <h2 className="text-xl font-semibold mb-2  capitalize">
                {productName}
              </h2>

              <table
                className="w-full border rounded-md table-fixed"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-center ">Date</th>
                    <th className="px-3 py-2 text-center ">Unit</th>

                    <th className="px-3 py-2 text-center ">Price </th>
                    <th className="px-3 py-2 text-center ">Quantity </th>
                    <th className="px-3 py-2 text-center">Status </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t"
                      style={{
                        pageBreakInside: "avoid",
                      }}
                    >
                      <td className="px-3 py-2 text-center">
                        {item.order_date
                          ? dayjs(item.order_date).format("DD-MM-YYYY")
                          : ""}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.product_unit_value} {item.unit}
                      </td>{" "}
                      <td className="px-3 py-2 text-center">
                        {item.product_price}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.product_qnty}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {item.order_status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-20">No data found.</div>
        )}
      </div>
    </Card>
  );
};

export default OrderProductReport;
