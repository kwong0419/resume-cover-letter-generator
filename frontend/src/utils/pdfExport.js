import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Exports content to PDF
 * @param {string} contentId - The ID of the HTML element to export
 * @param {string} fileName - The name of the PDF file (without extension)
 * @param {Function} setIsLoading - Function to update loading state
 * @param {Function} setError - Function to update error state
 */
export const exportToPDF = (contentId, fileName, setIsLoading, setError) => {
  const input = document.getElementById(contentId)

  if (!input) {
    setError('Nothing to export yet!')
    return
  }

  setIsLoading(true)

  html2canvas(input, {
    scale: 2,
    useCORS: true,
    logging: false,
  })
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 30

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`${fileName}.pdf`)
      setIsLoading(false)
    })
    .catch((err) => {
      console.error('Error generating PDF:', err)
      setError('Failed to generate PDF')
      setIsLoading(false)
    })
}

/**
 * Enhanced PDF export with custom formatting
 * @param {string} type - 'resume' or 'coverLetter'
 * @param {string} content - The text content to export
 * @param {Object} personInfo - Personal information object
 * @param {string} fileName - The name of the PDF file (without extension)
 * @param {Function} setIsLoading - Function to update loading state
 * @param {Function} setError - Function to update error state
 */
export const exportFormattedPDF = (type, content, personInfo, fileName, setIsLoading, setError) => {
  if (!content) {
    setError('Nothing to export yet!')
    return
  }

  setIsLoading(true)

  try {
    const pdf = new jsPDF()

    // Add header with name
    pdf.setFontSize(24)
    pdf.setTextColor(44, 62, 80) // #2c3e50
    pdf.text(personInfo.name, 105, 20, {align: 'center'})

    // Add contact info
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    const contactInfo = `Email: ${personInfo.email} | Phone: ${personInfo.phone}`
    pdf.text(contactInfo, 105, 30, {align: 'center'})

    if (personInfo.address) {
      pdf.text(personInfo.address, 105, 35, {align: 'center'})
    }

    if (type === 'resume' && personInfo.linkedin) {
      pdf.text(`LinkedIn: ${personInfo.linkedin}`, 105, personInfo.address ? 40 : 35, {align: 'center'})
    }

    // Add content
    pdf.setFontSize(12)
    pdf.setTextColor(0, 0, 0)

    const splitText = pdf.splitTextToSize(content, 180)
    pdf.text(splitText, 15, personInfo.linkedin ? 50 : 45)

    pdf.save(`${fileName}.pdf`)
    setIsLoading(false)
  } catch (err) {
    console.error('Error generating PDF:', err)
    setError('Failed to generate PDF')
    setIsLoading(false)
  }
}
