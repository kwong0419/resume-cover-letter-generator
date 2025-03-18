import React from 'react'
import '../styles/FormattedDocument.css'

const FormattedDocument = ({content, type}) => {
  // Function to process the content and apply formatting
  const formatContent = (text) => {
    if (!text) return []

    // Split by lines
    const lines = text.split('\n')

    // Process lines to identify sections, headings, etc.
    return lines.map((line, index) => {
      // Check if line is a heading (all caps or ends with a colon)
      const isHeading = line.toUpperCase() === line && line.trim().length > 0 && line.trim().length < 30
      const isSubHeading = line.trim().endsWith(':') && line.trim().length < 50

      // Check if line is a bullet point
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')

      // Apply appropriate CSS class
      let className = ''
      if (isHeading) className = 'document-heading'
      else if (isSubHeading) className = 'document-subheading'
      else if (isBullet) className = 'document-bullet'
      else if (line.trim() === '') className = 'document-blank-line'
      else className = 'document-text'

      return (
        <div key={index} className={className}>
          {line}
        </div>
      )
    })
  }

  return <div className={`formatted-document ${type}-document`}>{formatContent(content)}</div>
}

export default FormattedDocument
