import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// PDF Export Function
export const exportToPDF = async (scenario, results) => {
  try {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Investment Fee Impact Report', 10, 20);
    
    // Add scenario details
    doc.setFontSize(12);
    doc.text(`Scenario: ${scenario.name}`, 10, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 40);
    
    // Investment Details
    doc.setFontSize(14);
    doc.text('Investment Details', 10, 55);
    doc.setFontSize(10);
    doc.text(`Initial Investment: $${scenario.initialInvestment.toLocaleString()}`, 10, 65);
    doc.text(`Annual Contribution: $${scenario.annualContribution.toLocaleString()}`, 10, 75);
    doc.text(`Investment Period: ${scenario.investmentPeriod} years`, 10, 85);
    doc.text(`Expected Annual Return: ${scenario.expectedReturn}%`, 10, 95);
    
    // Fees Details
    doc.setFontSize(14);
    doc.text('Fees Impact', 10, 110);
    doc.setFontSize(10);
    doc.text(`Annual Fee: ${scenario.annualFee}%`, 10, 120);
    if (scenario.advancedMode) {
      doc.text(`Advisory Fee: ${scenario.advisoryFee}%`, 10, 130);
      doc.text(`Trading Costs: ${scenario.tradingCosts}%`, 10, 140);
      doc.text(`Tax Drag: ${scenario.taxDrag}%`, 10, 150);
    }
    
    // Results
    doc.setFontSize(14);
    doc.text('Results', 10, 170);
    doc.setFontSize(10);
    doc.text(`Total Without Fees: $${results.withoutFeesResult.toLocaleString()}`, 10, 180);
    doc.text(`Total With Fees: $${results.withFeesResult.toLocaleString()}`, 10, 190);
    doc.text(`Total Fees Paid: $${results.feesTotal.toLocaleString()}`, 10, 200);
    doc.text(`T-Rex Score: ${results.tRexScore.toFixed(2)}`, 10, 210);
    
    // Save the PDF
    doc.save(`${scenario.name}_Fee_Impact_Report.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert('Failed to export PDF. Please try again.');
  }
};

// Web Share API Function
export const shareResults = async (scenario, results) => {
  // Check if Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'My Investment Fee Impact',
        text: `Investment Scenario: ${scenario.name}
        
Total Without Fees: $${results.withoutFeesResult.toLocaleString()}
Total With Fees: $${results.withFeesResult.toLocaleString()}
Total Fees Paid: $${results.feesTotal.toLocaleString()}
T-Rex Score: ${results.tRexScore.toFixed(2)}

Calculated using FourStar Fees Investment Calculator`,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share. Please try again.');
    }
  } else {
    // Fallback for browsers that don't support Web Share API
    const textToCopy = `Investment Scenario: ${scenario.name}

Total Without Fees: $${results.withoutFeesResult.toLocaleString()}
Total With Fees: $${results.withFeesResult.toLocaleString()}
Total Fees Paid: $${results.feesTotal.toLocaleString()}
T-Rex Score: ${results.tRexScore.toFixed(2)}

Calculated using FourStar Fees Investment Calculator
${window.location.href}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      alert('Results copied to clipboard. You can now share via your preferred method.');
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      alert('Unable to copy results. Please manually copy.');
    }
  }
};

// Screenshot Export Function (alternative to PDF)
export const exportScreenshot = async (elementId) => {
  try {
    const element = document.getElementById(elementId);
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'investment_results_screenshot.png';
    link.click();
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    alert('Failed to capture screenshot. Please try again.');
  }
};