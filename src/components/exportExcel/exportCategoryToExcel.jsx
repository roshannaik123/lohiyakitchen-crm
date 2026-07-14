import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportCategoryReportToExcel = async (
  data,
  title = "Category Report"
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Category Report");

  // Define columns
  const columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Description", key: "description", width: 60 },
    { header: "Sort Order", key: "sortOrder", width: 15 },
  ];
  worksheet.columns = columns;

  const columnCount = columns.length;

  // ----- TITLE ROW -----
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

  // ----- HEADER ROW -----
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
    const isInactive = item.is_active === "false";

    row.getCell(1).value = item.category_name ?? "";
    row.getCell(2).value = item.category_description ?? "";
    row.getCell(3).value = item.category_sort_order ?? "";

    for (let j = 1; j <= columnCount; j++) {
      const cell = row.getCell(j);
      cell.alignment = {
        vertical: "middle",
        horizontal: j === 3 ? "right" : "left",
        indent: 1,
        wrapText: true, // ✅ This enables multiline text wrapping
      };
    }

    if (isInactive) {
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "ffe5e5" },
        };
      });
    }

    row.commit();
  });

  // ----- EXPORT -----
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${title.replace(/\s+/g, "_")}.xlsx`);
};
