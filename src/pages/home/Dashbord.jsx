import { Card, Spin, Table, Typography } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DASHBOARD } from "../../api";
import OrderStatusTag from "../../components/common/OrderStatusTag";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";
const { Title } = Typography;

const Dashboard = () => {

  const navigate = useNavigate();
  const { data: data, isMutating } = useGetApiMutation({
    url: DASHBOARD,
    queryKey: ["dashboard"],
  });
  const monthlyData = data?.monthly || [];

  const cardItems = [
    {
      title: "Categories",
      count: data?.categoryCount || "",
      link: "/category",
    },
    { title: "Products", count: data?.productCount || "", link: "/product" },
    { title: "Orders", count: data?.orderCount || "", link: "/order" },
    { title: "Users", count: data?.userCount || "", link: "" },
    {
      title: "Guest Users",
      count: data?.guestuserCount || "",
      link: "",
    },
  ];

  const orderColumns = [
    {
      title: "Order No",
      dataIndex: "order_no",
      key: "order_no",
    },
    {
      title: "Order Ref",
      dataIndex: "order_ref_number",
      key: "order_ref_number",
    },
    {
      title: "Company",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text) => `₹${text}`,
    },
    {
      title: "Date",
      dataIndex: "order_date",
      key: "order_date",
      render: (text) => (text ? dayjs(text).format("DD-MM-YYYY") : "-"),
    },
    {
      title: "Status",
      dataIndex: "order_status",
      key: "order_status",
      render: (status) => <OrderStatusTag status={status} />,
    },
  ];

  return (
    <>
      {isMutating || !data ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <div className="p-4 space-y-6">
          <Title level={3}>Dashboard</Title>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cardItems.map((item, index) => (
              <Card
                key={index}
                title={item.title}
                variant="filled"
                onClick={() => navigate(item.link)}
                className="shadow-md text-center cursor-pointer"
              >
                <p className="text-2xl font-semibold">{item.count}</p>
              </Card>
            ))}
          </div>

          <Card title="Latest Orders" className="shadow-md overflow-x-auto">
            <Table
              dataSource={data.latestOrders}
              columns={orderColumns}
              rowKey="id"
              pagination={false}
            />
          </Card>

          <Card title="Monthly Order Summary" style={{ marginTop: 10 }}>
            {monthlyData && monthlyData.length > 0 ? (
              <div style={{ width: "100%", height: 350, overflow: "hidden" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                  >
                    <XAxis
                      type="number"
                      tick={{ fill: "#000", fontSize: 12 }}
                      axisLine={{ stroke: "#000" }}
                      tickLine={{ stroke: "#000" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="month_name"
                      tick={{ fill: "#000", fontSize: 12 }}
                      axisLine={{ stroke: "#000" }}
                      tickLine={{ stroke: "#000" }}
                    />
                    <Tooltip
                      wrapperStyle={{ zIndex: 1000 }}
                      formatter={(value) => [`₹${value}`, "Total"]}
                      labelStyle={{ color: "#000" }}
                    />
                    <Bar
                      dataKey="total_amount"
                      fill="#1677ff"
                      barSize={monthlyData.length === 1 ? 30 : 40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
                No data available
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default Dashboard;
