import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateTripPDF } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const DownloadButton = ({ trip, printRef, userId }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle PDF generation and download
  const handleDownload = async () => {
    if (!trip) {
      toast.error("No trip data available");
      return;
    }

    setIsGenerating(true);
    try {
      const success = await generateTripPDF(trip, printRef, userId);
      if (success) {
        toast.success("Trip plan downloaded successfully!");
      } else {
        toast.error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error creating PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  // Alternative using react-to-print
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Trip to ${trip?.destination || 'Your Trip'}`,
    onBeforeGetContent: () => {
      setIsGenerating(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsGenerating(false);
      toast.success("PDF generated successfully!");
    },
    onPrintError: () => {
      setIsGenerating(false);
      toast.error("Failed to generate PDF");
    }
  });

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating || !trip}
      className="bg-primary text-white flex items-center gap-2"
    >
      <Download size={18} />
      {isGenerating ? "Generating PDF..." : "Download Trip Plan"}
    </Button>
  );
};

export default DownloadButton; 