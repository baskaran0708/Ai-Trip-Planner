import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';

/**
 * Generates a PDF from a trip plan and downloads it
 * @param {Object} tripData - The trip data object
 * @param {React.RefObject} contentRef - React ref to the content to be captured
 * @param {string} userId - Optional user ID for analytics
 * @returns {Promise<boolean>} - Success status
 */
export const generateTripPDF = async (tripData, contentRef, userId) => {
  try {
    const content = contentRef.current;
    if (!content) {
      console.error("Cannot find element to capture");
      return false;
    }

    // Create a canvas from the DOM element
    const canvas = await html2canvas(content, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow images from other domains
      logging: false,
      letterRendering: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Initialize PDF document with A4 dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    // Add trip title
    pdf.setFontSize(22);
    pdf.text(`Trip Plan: ${tripData.destination || 'Your Trip'}`, 20, 20);
    
    // Add image of the trip details
    pdf.addImage(imgData, 'PNG', imgX, 30, imgWidth * ratio, imgHeight * ratio);
    
    // Add footer
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, pdfHeight - 10);
    
    // Download the PDF
    const destination = tripData.destination || 'Your_Trip';
    pdf.save(`Trip_to_${destination.replace(/\s+/g, '_')}.pdf`);
    
    // Log download activity for analytics if user is logged in
    if (userId) {
      try {
        await addDoc(collection(db, "download_logs"), {
          userId,
          tripDestination: tripData.destination || 'Unnamed Trip',
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error("Failed to log download:", error);
        // Continue regardless of logging error
      }
    }
    
    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    return false;
  }
}; 