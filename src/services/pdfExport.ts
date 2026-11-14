import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportElementToPdf = async (
  elementId: string,
  fileName: string
): Promise<boolean> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Crisp high-DPI rendering
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Handle single or multi-page if height exceeds A4 height (297mm)
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 5) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    return false;
  }
};

export const triggerPrint = () => {
  window.print();
};

export const generateWhatsAppLink = (
  phone: string,
  docType: string,
  docNo: string,
  customerName: string,
  amountOrQty: string,
  date: string
) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = `*${docType.toUpperCase()} ISSUED*\n` +
    `Document No: ${docNo}\n` +
    `Date: ${date}\n` +
    `Customer: ${customerName}\n` +
    `Details: ${amountOrQty}\n` +
    `Issued by: Veyon Automation & Robotics Pvt. Ltd.\n\n` +
    `Thank you for your business!`;

  const encoded = encodeURIComponent(message);
  if (cleanPhone && cleanPhone.length >= 10) {
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
};
