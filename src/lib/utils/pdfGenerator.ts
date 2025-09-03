import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReservationPDFData {
  confirmationNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  roomName: string;
  roomLocation?: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  numberOfGuests: number;
  totalAmount: number;
  currency: string;
  specialRequests?: string;
  companyName?: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}

export async function generateReservationPDF(data: ReservationPDFData): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: string) => {
    try {
      const formatted = new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
      return `${currency} ${formatted.replace(/[^0-9.,\s]/g, '').trim()}`;
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  // Set font defaults
  pdf.setFontSize(12);
  
  // Company Header with Logo
  if (data.companyLogo) {
    try {
      // Convert logo URL to base64 if needed
      const logoImage = new Image();
      logoImage.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        logoImage.onload = resolve;
        logoImage.onerror = () => {
          console.error('Could not load logo for PDF');
          resolve(null);
        };
        logoImage.src = data.companyLogo ?? '';
      });
      
      if (logoImage.complete && logoImage.naturalHeight !== 0) {
        // Calculate logo dimensions to maintain aspect ratio
        const maxWidth = 50;
        const maxHeight = 30;
        let logoWidth = maxWidth;
        let logoHeight = maxHeight;
        
        const aspectRatio = logoImage.naturalWidth / logoImage.naturalHeight;
        if (aspectRatio > maxWidth / maxHeight) {
          logoHeight = maxWidth / aspectRatio;
        } else {
          logoWidth = maxHeight * aspectRatio;
        }
        
        // Center the logo
        const logoX = (pageWidth - logoWidth) / 2;
        pdf.addImage(logoImage, 'PNG', logoX, yPosition, logoWidth, logoHeight);
        yPosition += logoHeight + 5;
      }
    } catch (e) {
      console.error('Error adding logo to PDF:', e);
      // If logo fails, just show company name
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(data.companyName || 'Hotel & Resort', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    }
  } else {
    // No logo, show company name
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.companyName || 'Hotel & Resort', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  }

  // Company Details
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  if (data.companyAddress) {
    pdf.text(data.companyAddress, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
  }
  if (data.companyPhone || data.companyEmail) {
    const contactInfo = [data.companyPhone, data.companyEmail].filter(Boolean).join(' | ');
    pdf.text(contactInfo, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  }

  // Line separator
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(34, 197, 94); // Green color
  pdf.text('CONFIRMACIÓN DE RESERVACIÓN', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Confirmation Number Box
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition, pageWidth - (margin * 2), 20, 'F');
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Número de Confirmación:', pageWidth / 2, yPosition + 7, { align: 'center' });
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.confirmationNumber, pageWidth / 2, yPosition + 14, { align: 'center' });
  yPosition += 30;

  // Guest Information Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Información del Huésped', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Nombre: ${data.customerName}`, margin, yPosition);
  yPosition += 6;
  pdf.text(`Email: ${data.customerEmail}`, margin, yPosition);
  yPosition += 6;
  if (data.customerPhone) {
    pdf.text(`Teléfono: ${data.customerPhone}`, margin, yPosition);
    yPosition += 6;
  }
  pdf.text(`Número de huéspedes: ${data.numberOfGuests}`, margin, yPosition);
  yPosition += 12;

  // Room Information Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detalles de la Habitación', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Habitación: ${data.roomName}`, margin, yPosition);
  yPosition += 6;
  if (data.roomLocation) {
    pdf.text(`Ubicación: ${data.roomLocation}`, margin, yPosition);
    yPosition += 6;
  }
  yPosition += 6;

  // Dates Section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Fechas de Estadía', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  // Check-in
  pdf.text('Check-in:', margin, yPosition);
  pdf.text(formatDate(data.checkInDate), margin + 25, yPosition);
  if (data.checkInTime) {
    pdf.text(`(A partir de las ${data.checkInTime})`, margin + 90, yPosition);
  }
  yPosition += 6;

  // Check-out
  pdf.text('Check-out:', margin, yPosition);
  pdf.text(formatDate(data.checkOutDate), margin + 25, yPosition);
  if (data.checkOutTime) {
    pdf.text(`(Antes de las ${data.checkOutTime})`, margin + 90, yPosition);
  }
  yPosition += 12;

  // Special Requests
  if (data.specialRequests) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Solicitudes Especiales', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    // Wrap text for special requests
    const lines = pdf.splitTextToSize(data.specialRequests, pageWidth - (margin * 2));
    lines.forEach((line: string) => {
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 6;
  }

  // Total Amount
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Pagado:', margin, yPosition);
  pdf.setTextColor(34, 197, 94);
  pdf.text(formatCurrency(data.totalAmount, data.currency), pageWidth - margin, yPosition, { align: 'right' });
  pdf.setTextColor(0, 0, 0);
  yPosition += 12;

  // Important Information
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Información Importante', margin, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const importantInfo = [
    '• Se ha enviado un email de confirmación a su correo electrónico.',
    '• Por favor presente este documento al hacer check-in.',
    '• Si necesita hacer cambios, contáctenos lo antes posible.',
    '• Revise nuestras políticas de cancelación en el email de confirmación.'
  ];

  importantInfo.forEach(info => {
    pdf.text(info, margin, yPosition);
    yPosition += 6;
  });

  // Footer
  yPosition = pdf.internal.pageSize.getHeight() - 20;
  pdf.setFontSize(9);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Documento generado el ${new Date().toLocaleString('es-ES')}`, pageWidth / 2, yPosition, { align: 'center' });

  // Save the PDF
  pdf.save(`reservacion-${data.confirmationNumber}.pdf`);
}

// Alternative method using HTML element capture
export async function generateReservationPDFFromHTML(elementId: string, fileName?: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for PDF generation');
    return;
  }

  try {
    // Temporarily show the element if hidden for print
    const originalDisplay = element.style.display;
    element.style.display = 'block';

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true, // Allow cross-origin images
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Restore original display
    element.style.display = originalDisplay;

    // Convert to PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate ratio to fit image in PDF
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 25.4; // Convert to mm
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;
    
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Save the PDF
    pdf.save(fileName || 'reservacion.pdf');
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw error;
  }
}