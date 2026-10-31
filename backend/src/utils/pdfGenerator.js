const PDFDocument = require('pdfkit');

function generateInvoicePdf(invoice, res) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="Invoice-${invoice.invoice_number}.pdf"`);

  doc.pipe(res);

  // Header / Brand
  doc
    .fillColor('#1E1B4B')
    .fontSize(24)
    .text('RECLAIM AI', 50, 45)
    .fontSize(10)
    .fillColor('#6366F1')
    .text('Intelligent Subscription Value Exchange', 50, 72)
    .fillColor('#4B5563')
    .text('Brightloop Software Technologies Pvt. Ltd.', 50, 86)
    .text('Tower B, Tech Park, Outer Ring Road, Bengaluru, 560103', 50, 98)
    .text('GSTIN: 29AAACB1000C1Z5 | contact@brightloop.io', 50, 110);

  // Invoice Title & Status
  doc
    .fontSize(20)
    .fillColor('#111827')
    .text('INVOICE', 400, 45, { align: 'right' })
    .fontSize(10)
    .fillColor('#4B5563')
    .text(`Invoice #: ${invoice.invoice_number}`, 400, 72, { align: 'right' })
    .text(`Invoice Date: ${invoice.invoice_date || 'N/A'}`, 400, 86, { align: 'right' })
    .text(`Due Date: ${invoice.due_date || 'N/A'}`, 400, 98, { align: 'right' })
    .text(`Status: ${(invoice.status || 'DRAFT').toUpperCase()}`, 400, 110, { align: 'right' });

  // Divider
  doc
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .moveTo(50, 135)
    .lineTo(550, 135)
    .stroke();

  // Billed To & Subscription Info
  doc
    .fontSize(11)
    .fillColor('#111827')
    .text('BILLED TO:', 50, 150)
    .fontSize(10)
    .fillColor('#374151')
    .text(invoice.customer_name || 'Customer Name', 50, 166)
    .text(invoice.company_name || 'Company Name', 50, 180)
    .text(invoice.billing_address || 'Address on file', 50, 194)
    .text(`Email: ${invoice.customer_email || 'N/A'}`, 50, 208)
    .text(`Tax ID: ${invoice.tax_number || 'N/A'}`, 50, 222);

  doc
    .fontSize(11)
    .fillColor('#111827')
    .text('SUBSCRIPTION DETAILS:', 320, 150)
    .fontSize(10)
    .fillColor('#374151')
    .text(`Subscription: ${invoice.subscription_number || 'N/A'}`, 320, 166)
    .text(`Billing Plan: ${invoice.plan_name || 'Enterprise Subscription'}`, 320, 180)
    .text(`Cycle: ${(invoice.billing_frequency || 'Monthly').toUpperCase()}`, 320, 194)
    .text(`Payment Terms: ${invoice.payment_terms || 'Net 30'}`, 320, 208);

  // Table Header
  const tableTop = 260;
  doc
    .rect(50, tableTop, 500, 24)
    .fill('#F3F4F6');

  doc
    .fillColor('#374151')
    .fontSize(9)
    .text('DESCRIPTION', 60, tableTop + 7)
    .text('QTY', 300, tableTop + 7, { width: 40, align: 'right' })
    .text('UNIT PRICE', 350, tableTop + 7, { width: 70, align: 'right' })
    .text('TAX', 425, tableTop + 7, { width: 40, align: 'right' })
    .text('TOTAL', 475, tableTop + 7, { width: 65, align: 'right' });

  // Table Rows
  let y = tableTop + 30;
  const items = invoice.items && invoice.items.length > 0
    ? invoice.items
    : [{ description: 'Subscription Service & Value Exchange Seats', quantity: 1, unit_price: invoice.subtotal || 0, tax_rate: 18, total_amount: invoice.total_amount || 0 }];

  items.forEach((item) => {
    doc
      .fillColor('#111827')
      .fontSize(9)
      .text(item.description || 'Service Line', 60, y)
      .text(String(item.quantity || 1), 300, y, { width: 40, align: 'right' })
      .text(`INR ${(parseFloat(item.unit_price) || 0).toLocaleString()}`, 350, y, { width: 70, align: 'right' })
      .text(`${item.tax_rate || 18}%`, 425, y, { width: 40, align: 'right' })
      .text(`INR ${(parseFloat(item.total_amount) || 0).toLocaleString()}`, 475, y, { width: 65, align: 'right' });

    y += 24;
  });

  // Table Bottom Divider
  doc
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();

  // Summary Totals
  const summaryTop = y + 15;
  const subtotal = parseFloat(invoice.subtotal) || 0;
  const taxTotal = parseFloat(invoice.tax_total) || 0;
  const discountTotal = parseFloat(invoice.discount_total) || 0;
  const totalAmount = parseFloat(invoice.total_amount) || 0;
  const amountPaid = parseFloat(invoice.amount_paid) || 0;
  const balanceDue = parseFloat(invoice.balance_due) || 0;

  doc
    .fontSize(9)
    .fillColor('#4B5563')
    .text('Subtotal:', 350, summaryTop, { width: 100, align: 'right' })
    .fillColor('#111827')
    .text(`INR ${subtotal.toLocaleString()}`, 460, summaryTop, { width: 80, align: 'right' })

    .fillColor('#4B5563')
    .text('Tax (GST/VAT):', 350, summaryTop + 16, { width: 100, align: 'right' })
    .fillColor('#111827')
    .text(`INR ${taxTotal.toLocaleString()}`, 460, summaryTop + 16, { width: 80, align: 'right' })

    .fillColor('#4B5563')
    .text('Discounts Applied:', 350, summaryTop + 32, { width: 100, align: 'right' })
    .fillColor('#10B981')
    .text(`- INR ${discountTotal.toLocaleString()}`, 460, summaryTop + 32, { width: 80, align: 'right' })

    .fillColor('#111827')
    .fontSize(11)
    .text('Total Amount:', 350, summaryTop + 52, { width: 100, align: 'right' })
    .text(`INR ${totalAmount.toLocaleString()}`, 460, summaryTop + 52, { width: 80, align: 'right' })

    .fontSize(9)
    .fillColor('#4B5563')
    .text('Amount Paid:', 350, summaryTop + 72, { width: 100, align: 'right' })
    .fillColor('#111827')
    .text(`INR ${amountPaid.toLocaleString()}`, 460, summaryTop + 72, { width: 80, align: 'right' })

    .fillColor('#DC2626')
    .fontSize(10)
    .text('Balance Due:', 350, summaryTop + 90, { width: 100, align: 'right' })
    .text(`INR ${balanceDue.toLocaleString()}`, 460, summaryTop + 90, { width: 80, align: 'right' });

  // Notes & Footer
  doc
    .fontSize(9)
    .fillColor('#6B7280')
    .text('Payment Terms & Instructions:', 50, summaryTop + 40)
    .text('Please remit payments to Brightloop Software Technologies Pvt. Ltd.', 50, summaryTop + 54)
    .text('Bank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0001234', 50, summaryTop + 68)
    .text('UPI ID: brightloop@hdfcbank | Questions? finance@brightloop.io', 50, summaryTop + 82);

  doc
    .fontSize(8)
    .fillColor('#9CA3AF')
    .text('Generated automatically by RECLAIM AI - Intelligent Subscription Value Exchange platform.', 50, 720, { align: 'center', width: 500 });

  doc.end();
}

module.exports = { generateInvoicePdf };
