import {
  FileExcelOutlined,
  FilePdfOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Button, Card, Select, Spin, Tooltip } from "antd";

import { useEffect, useRef, useState } from "react";
import { PRODUCT_REPORT } from "../../../api";
import useToken from "../../../api/usetoken";

import { downloadPDF } from "../../../components/pdfExport/pdfExport";
import { useApiMutation } from "../../../hooks/useApiMutation";
import { exportProductTOExcel } from "../../../components/exportExcel/exportProductToExcel";
import { useReactToPrint } from "react-to-print";
const { Option } = Select;

const ProductReport = () => {
  const token = useToken();
  const productRef = useRef(null);
  const [category, setCategory] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState([]);

  const { trigger: fetchCategoryReport, loading: isMutating } =
    useApiMutation();

  useEffect(() => {
    const getReport = async () => {
      try {
        const res = await fetchCategoryReport({
          url: PRODUCT_REPORT,
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
        console.error("Failed to fetch product report:", error);
      }
    };

    getReport();
  }, []);

  const handleFilterChange = (value) => {
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
    content: () => productRef.current,
    documentTitle: "product-report",
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
        title="Product Report"
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
                  downloadPDF("printable-section", "Product Report.pdf")
                }
              />
            </Tooltip>

            <Tooltip title="Excel Report">
              <Button
                type="default"
                shape="circle"
                icon={<FileExcelOutlined />}
                onClick={() =>
                  exportProductTOExcel(filteredCategory, "Product Report")
                }
              />
            </Tooltip>
          </div>
        }
      >
        {/* Only this part will be printed */}
        <div
          ref={productRef}
          id="printable-section"
          className="p-0 m-0 print:p-0 print:m-0"
        >
          <h2 className="text-xl font-semibold">Product Report</h2>

          {isMutating ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : filteredCategory.length > 0 ? (
            <table
              className="w-full border rounded-md table-fixed"
              style={{ width: "100%", borderCollapse: "collapse" }}
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
                {filteredCategory.map((item) => (
                  <tr
                    key={item.product_name}
                    style={{
                      pageBreakInside: "avoid",
                      backgroundColor:
                        item.is_active === "false" ? "#ffe5e5" : "transparent",
                    }}
                    className={`border-t ${
                      item.is_active === "false" ? "inactive-row" : ""
                    }`}
                  >
                    <td className="px-3 py-2 font-medium">
                      {item.product_name}
                    </td>

                    <td className="px-3 py-2 text-center">
                      {item.product_unit_value}-{item.unit}
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
export default ProductReport;
