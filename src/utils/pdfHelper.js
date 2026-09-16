import { jsPDF } from 'jspdf'

function nfc(text) {
  return String(text || '').normalize('NFC')
}

export function createPdf(options) {
  const doc = new jsPDF(options)
  const origText = doc.text.bind(doc)
  doc.text = function (text, ...args) {
    return origText(nfc(text), ...args)
  }
  const origSplit = doc.splitTextToSize.bind(doc)
  doc.splitTextToSize = function (text, ...args) {
    return origSplit(nfc(text), ...args)
  }
  return doc
}

export function renderLine(doc, line, centerX, y, opts = {}) {
  const fontSize = opts.fontSize || 10
  const color = opts.color || [22, 19, 12]
  const align = opts.align || 'center'
  const pageWidth = opts.pageWidth || 216
  const marginLeft = opts.marginLeft || 18
  const marginRight = opts.marginRight || 18
  const contentWidth = pageWidth - marginLeft - marginRight

  const parts = nfc(line).split(/\(BIS\)/gi)
  if (parts.length === 1) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(fontSize)
    doc.setTextColor(...color)
    doc.text(parts[0], centerX, y, { align })
    return
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(fontSize)
  doc.setTextColor(...color)
  const totalWidth = doc.getTextWidth(nfc(line))

  let startX
  if (align === 'center') {
    startX = (pageWidth - totalWidth) / 2
  } else if (align === 'right') {
    startX = pageWidth - marginRight - totalWidth
  } else {
    startX = marginLeft
  }

  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...color)
      doc.text(parts[i], startX, y)
      startX += doc.getTextWidth(parts[i])
    }
    if (i < parts.length - 1) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...color)
      doc.text('(BIS)', startX, y)
      startX += doc.getTextWidth('(BIS)')
    }
  }
}
