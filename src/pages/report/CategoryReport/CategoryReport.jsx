import { Button, Card, Image, Select, Spin, Tooltip } from "antd";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_REPORT } from "../../../api";
import useToken from "../../../api/usetoken";
import { useApiMutation } from "../../../hooks/useApiMutation";
import { downloadPDF } from "../../../components/pdfExport/pdfExport";
import {
  PrinterOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { exportCategoryReportToExcel } from "../../../components/exportExcel/exportCategoryToExcel";
import { useReactToPrint } from "react-to-print";
const { Option } = Select;

const CategoryReport = () => {
  const token = useToken();
const categoryRef = useRef(null);
  const [category, setCategory] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState([]);
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [noImageUrl, setNoImageUrl] = useState("");

  const { trigger: fetchCategoryReport, loading: isMutating } =
    useApiMutation();

  useEffect(() => {
    const getReport = async () => {
      try {
        const res = await fetchCategoryReport({
          url: CATEGORY_REPORT,
          method: "post",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.code === 201) {
          const images = res.image_url || [];
          const imgUrlObj = Object.fromEntries(
            images.map((i) => [i.image_for, i.image_url])
          );
          setImageBaseUrl(imgUrlObj["Category"] || "");
          setNoImageUrl(imgUrlObj["No Image"] || "");
          setCategory(res.data);
          setFilteredCategory(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch category report:", error);
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
     content: () => categoryRef.current, 
     documentTitle: "category-report",
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
    <>
      <Card
        title="Category Report"
        className="shadow-md rounded-lg"
        extra={
          <div className="flex items-center gap-2">
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
                  downloadPDF("printable-section", "Category Report.pdf")
                }
              />
            </Tooltip>

            <Tooltip title="Excel Report">
              <Button
                type="default"
                shape="circle"
                icon={<FileExcelOutlined />}
                onClick={() =>
                  exportCategoryReportToExcel(
                    filteredCategory,
                    "Category Report"
                  )
                }
              />
            </Tooltip>
          </div>
        }
      >
        <div ref={categoryRef} id='printable-section' className="p-0 m-0 print:p-0 print:m-0">
          <h2 className="text-xl font-semibold">Category Report</h2>

          {isMutating ? (
            <div className="flex justify-center py-20">
              <Spin size="large" />
            </div>
          ) : filteredCategory.length > 0 ? (
            <table
              className="w-full border rounded-md table-fixed text-[14px]"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left w-[100px]">Image</th>
                  <th className="px-3 py-2 text-left w-[150px]">Name</th>
                  <th className="px-3 py-2 text-left w-[250px]">Description</th>
                  <th className="px-3 py-2 text-center w-[100px]">
                    Sort Order
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCategory.map((item) => (
                  <tr
                    key={item.category_name}
                    className="border-t"
                    style={{
                      pageBreakInside: "avoid",
                      backgroundColor:
                        item.is_active === "false" ? "#ffe5e5" : "transparent",
                    }}
                  >
                    <td className="px-3 py-2">
                      <div className="w-[60px] h-[60px] rounded overflow-hidden">
                        <Image
                          width={60}
                          height={60}
                          src={`${imageBaseUrl}${item.category_image}`}
                          fallback={noImageUrl}
                          alt="Category"
                          style={{ objectFit: "cover", borderRadius: 8 }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 font-medium break-words">
                      {item.category_name}
                    </td>
                    <td className="px-3 py-2 break-words whitespace-pre-wrap min-w-0">
                      {item.category_description}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {item.category_sort_order}
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
export default CategoryReport;
