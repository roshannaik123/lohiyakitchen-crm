import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportOrderProductExcel = async (
  data,
  title = "Order Product Report"
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Product Report");

  const columns = [
    { header: "Date", key: "order_date", width: 25 },
    { header: "Unit", key: "unit_combined", width: 15 },
    { header: "Price", key: "product_price", width: 15 },
    { header: "Quantity", key: "product_qnty", width: 15 },
    { header: "Status", key: "order_status", width: 15 },
  ];
  worksheet.columns = columns;
  const columnCount = columns.length;

  // Title row
  worksheet.mergeCells(1, 1, 1, columnCount);
  const titleCell = worksheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center", vertical: "middle", indent: 1 };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "f3f4f6" },
  };
  worksheet.getRow(1).height = 30;

  let currentRowIndex = 3;

  // Group by category
  const grouped = data.reduce((acc, item) => {
    const cat = item.product_name || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([categoryName, items]) => {
    // Category sub-header
    const capitalizedCategoryName = categoryName
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    const categoryRow = worksheet.getRow(currentRowIndex++);
    const catCell = categoryRow.getCell(1);
    catCell.value = capitalizedCategoryName;
    catCell.font = { bold: true, size: 14 };
    catCell.alignment = {
      horizontal: "middle",
      vertical: "middle",
      indent: 1,
    };
    worksheet.mergeCells(`A${categoryRow.number}:E${categoryRow.number}`);
    categoryRow.height = 24;
    categoryRow.commit();

    // Table headers
    const headerRow = worksheet.getRow(currentRowIndex++);
    columns.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = col.header;
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "f3f4f6" },
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        indent: 1,
      };
    });
    headerRow.commit();

    // Data rows
    items.forEach((item) => {
      const row = worksheet.getRow(currentRowIndex++);
      const unit = `${item.product_unit_value ?? ""} ${item.unit ?? ""}`.trim();
      const orderdate = item.order_date
        ? dayjs(item.order_date).format("DD-MM-YYYY")
        : "";
      // Set cells explicitly with indent
      row.getCell(1).value = orderdate ?? "";
      row.getCell(2).value = unit;
      row.getCell(3).value = item.product_price ?? "";
      row.getCell(4).value = item.product_qnty ?? "";
      row.getCell(5).value = item.order_status ?? "";

      for (let i = 1; i <= columnCount; i++) {
        const cell = row.getCell(i);
        cell.alignment = {
          vertical: "middle",
          horizontal: i >= 3 ? "right" : "left",
          indent: 1,
        };
      }

      // Inactive row highlight
      if (item.is_active === "false") {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "ffe5e5" }, // Light red
          };
        });
      }

      row.commit();
    });

    // Gap row
    currentRowIndex++;
  });

  // Save file
  const buffer = await workbook.xlsx.writeBuffer();
  const sanitizedTitle = title.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
  saveAs(new Blob([buffer]), `${sanitizedTitle}.xlsx`);
};
