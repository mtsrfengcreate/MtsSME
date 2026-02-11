
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data: any[], fileName: string) => {
  const doc = new jsPDF();
  const headers = Object.keys(data[0] || {}).map(k => k.toUpperCase());
  const body = data.map(item => Object.values(item));

  autoTable(doc, {
    head: [headers],
    body: body,
  });

  doc.save(`${fileName}.pdf`);
};

// Simple Word-compatible format (as a text file with basic structure)
export const exportToWord = (data: any[], fileName: string) => {
  let content = "Relatório SME Curso\n\n";
  data.forEach((item, index) => {
    content += `Item ${index + 1}:\n`;
    Object.entries(item).forEach(([key, value]) => {
      content += `${key.toUpperCase()}: ${value}\n`;
    });
    content += "--------------------------\n";
  });

  const blob = new Blob([content], { type: 'application/msword' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.doc`;
  link.click();
};
