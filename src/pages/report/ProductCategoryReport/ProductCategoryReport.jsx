import {
  FileExcelOutlined,
  FilePdfOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Button, Card, Select, Spin, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";
import { PRODUCT_CATEGORY_REPORT } from "../../../api";
import useToken from "../../../api/usetoken";
import { downloadPDF } from "../../../components/pdfExport/pdfExport";
import { useApiMutation } from "../../../hooks/useApiMutation";
import { exportProductCategoryExcel } from "../../../components/exportExcel/exportProductCategoryExcel";
import { useReactToPrint } from "react-to-print";
const { Option } = Select;

const ProductCategoryReport = () => {
  const token = useToken();
const productCatRef = useRef(null);
  const [category, setCategory] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState([]);

  const { trigger: fetchCategoryReport, loading: isMutating } =
    useApiMutation();

  useEffect(() => {
    const getReport = async () => {
      try {
        const res = await fetchCategoryReport({
          url: PRODUCT_CATEGORY_REPORT,
          method: "post",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.code === 201) {
          setCategory(res.data);
          setFilteredCategory(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch product category report:", error);
      }
    };

    getReport();
  }, []);

  const handleFilterChange = (value) => {
    // setFilterStatus(value);
    if (value === "all") {
      setFilteredCategory(category);
    } else {
      const isActive = value === "active";
      setFilteredCategory(
        category.filter((item) => item.is_active === String(isActive))
      );
    }
  };

   
    const handlePrint = useReactToPrint({
        content: () => productCatRef.current, 
        documentTitle: "product-category-report",
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
            @media print {
   .inactive-row {
     background-color: #ffe5e5 !important;
     -webkit-print-color-adjust: exact;
     print-color-adjust: exact;
   }
 }
 
        `,
      });

  return (
    <>
      <Card
        title="Product Category Report"
        bordered={false}
        className="shadow-md rounded-lg"
        extra={
          <div className="flex  items-center gap-2">
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={handleFilterChange}
            >
              <Option value="all">All</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
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
                  downloadPDF("printable-section", "my-report.pdf")
                }
              />
            </Tooltip>

            <Tooltip title="Excel Report">
              <Button
                type="default"
                shape="circle"
                icon={<FileExcelOutlined />}
                onClick={() =>
                  exportProductCategoryExcel(
                    filteredCategory,
                    "Product Category Report"
                  )
                }
              />
            </Tooltip>
          </div>
        }
      >
        <div ref={productCatRef} id="printable-section" className="p-0 m-0 print:p-0 print:m-0">
          <h1 className="text-xl font-semibold mb-4 text-center">
            Product Category Report
          </h1>

          {isMutating ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : filteredCategory.length > 0 ? (
            Object.entries(
              filteredCategory.reduce((acc, item) => {
                if (!acc[item.category_names]) acc[item.category_names] = [];
                acc[item.category_names].push(item);
                return acc;
              }, {})
            ).map(([categoryName, items]) => (
              <div key={categoryName} className="mb-8">
                <h2 className="text-xl font-semibold mb-2">{categoryName}</h2>
                <table
                  className="w-full border rounded-md table-fixed"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-center w-[200px]">Name</th>
                      <th className="px-3 py-2 text-center w-[80px]">Unit</th>
                      <th className="px-3 py-2 text-center w-[100px]">MRP</th>
                      <th className="px-3 py-2 text-center w-[100px]">
                        Selling Price
                      </th>
                      <th className="px-3 py-2 text-center w-[100px]">
                        Special Offer
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-t ${item.is_active === "false" ? "inactive-row" : ""}`}
                        style={{
                          pageBreakInside: "avoid",
                          backgroundColor:
                            item.is_active === "false"
                              ? "#ffe5e5"
                              : "transparent",
                        }}
                      >
                        <td className="px-3 py-2 font-medium">
                          {item.product_name}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.product_unit_value} {item.unit_name}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.product_mrp}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.product_selling_price}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.product_spl_offer_price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-20">
              No data found.
            </div>
          )}
        </div>
      </Card>
    </>
  );
};
export default ProductCategoryReport;
