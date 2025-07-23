-- Offerwall Revenue Table
-- Tracks revenue data

CREATE TABLE IF NOT EXISTS offerwall_revenue (
    advertiser_id VARCHAR(255) NOT NULL,
    revenue_in_dollars DECIMAL(10,2),
    revenue_in_INR DECIMAL(10,2),
    app_package VARCHAR(255) NOT NULL, -- package id of the app
    dau INTEGER, -- DAU on particular date
    clicks INTEGER, -- Clicks on particular date
    conversions INTEGER, -- Conversions on particular date
    day DATE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offerwall_revenue_advertiser_id ON offerwall_revenue(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_offerwall_revenue_app_package ON offerwall_revenue(app_package);
CREATE INDEX IF NOT EXISTS idx_offerwall_revenue_day ON offerwall_revenue(day);
CREATE INDEX IF NOT EXISTS idx_offerwall_revenue_advertiser_day ON offerwall_revenue(advertiser_id, day); 