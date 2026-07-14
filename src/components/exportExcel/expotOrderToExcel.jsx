import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const expotOrderToExcel = async (data, title = "Order Report") => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Order Report");

  // Define columns
  const columns = [
    { header: "Date", key: "product_name", width: 20 },
    { header: "Order No", key: "product_brand", width: 15 },
    { header: "Company Name", key: "unit_combined", width: 30 },
    { header: "Amount", key: "product_mrp", width: 15 },
    { header: "Status", key: "product_selling_price", width: 15 },
  ];
  worksheet.columns = columns;

  const columnCount = columns.length;

  // ----- TITLE ROW (Row 1) -----
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

  // ----- HEADER ROW (Row 2) -----
  const headerRow = worksheet.getRow(2);
  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "f3f4f6" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle", indent: 1 };
    worksheet.getColumn(index + 1).width = col.width;
  });
  headerRow.commit();

  // ----- DATA ROWS -----
  data.forEach((item, i) => {
    const row = worksheet.getRow(i + 3);
    const values = [
      item.order_date ? dayjs(item.order_date).format("DD-MM-YYYY") : "",
      item.order_no,
      item.company_name,
      item.total_amount,
      item.order_status,
    ];

    values.forEach((val, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.value = val ?? "";
      cell.alignment = {
        vertical: "middle",
        horizontal: colIndex >= 3 ? "right" : "left", // right-align prices
        indent: 1,
        wrapText: true,
      };
    });

    row.commit();
  });

  // ----- EXPORT -----
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${title.replace(/\s+/g, "_")}.xlsx`);
};
