-- Offerwall Invoice Upload Table
-- Stores invoice upload information

CREATE TABLE IF NOT EXISTS offerwall_invoice_upload (
    advertiser_id VARCHAR(255) NOT NULL,
    invoice_number VARCHAR(255) NOT NULL,
    pdf VARCHAR(255), -- PDF file path
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Time stamp of details entered
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offerwall_invoice_upload_advertiser_id ON offerwall_invoice_upload(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_invoice_upload_invoice_number ON offerwall_invoice_upload(invoice_number);
CREATE INDEX IF NOT EXISTS idx_offerwall_invoice_upload_uploaded_at ON offerwall_invoice_upload(uploaded_at); 