-- ============================================================
-- Kin Research Platform - Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Users table (synced from Clerk)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Companies table
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    ticker TEXT UNIQUE NOT NULL,
    sector TEXT,
    industry TEXT,
    description TEXT,
    website TEXT,
    employees INTEGER,
    founded INTEGER,
    headquarters TEXT,
    ceo TEXT,
    logo_url TEXT,
    market_cap BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);

-- ============================================================
-- Research Reports table
-- ============================================================
CREATE TABLE IF NOT EXISTS research_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    title TEXT NOT NULL,
    company_overview JSONB,
    product_technology JSONB,
    financial_fundamentals JSONB,
    market_competition JSONB,
    catalysts_risks JSONB,
    conclusion JSONB,
    key_metrics JSONB,
    financial_snapshot JSONB,
    overall_score INTEGER,
    recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON research_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_company_id ON research_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_reports_ticker ON research_reports(ticker);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON research_reports(created_at DESC);

-- ============================================================
-- Search History table
-- ============================================================
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- ============================================================
-- Auto-update timestamp trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON research_reports;
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON research_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Seed sample companies data
-- ============================================================
INSERT INTO companies (name, ticker, sector, industry, description, website, employees, founded, headquarters, ceo, market_cap) VALUES
('Apple Inc.', 'AAPL', 'Technology', 'Consumer Electronics', 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.', 'https://www.apple.com', 164000, 1976, 'Cupertino, CA', 'Tim Cook', 2800000000000),
('Microsoft Corporation', 'MSFT', 'Technology', 'Software', 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.', 'https://www.microsoft.com', 221000, 1975, 'Redmond, WA', 'Satya Nadella', 3200000000000),
('Alphabet Inc.', 'GOOGL', 'Technology', 'Internet Content & Information', 'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, and internationally.', 'https://www.abc.xyz', 182000, 1998, 'Mountain View, CA', 'Sundar Pichai', 2100000000000),
('Amazon.com Inc.', 'AMZN', 'Consumer Cyclical', 'Internet Retail', 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally.', 'https://www.amazon.com', 1541000, 1994, 'Seattle, WA', 'Andy Jassy', 1900000000000),
('NVIDIA Corporation', 'NVDA', 'Technology', 'Semiconductors', 'NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally.', 'https://www.nvidia.com', 29600, 1993, 'Santa Clara, CA', 'Jensen Huang', 3400000000000),
('Tesla Inc.', 'TSLA', 'Consumer Cyclical', 'Auto Manufacturers', 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.', 'https://www.tesla.com', 140473, 2003, 'Austin, TX', 'Elon Musk', 800000000000),
('Meta Platforms Inc.', 'META', 'Technology', 'Internet Content & Information', 'Meta Platforms, Inc. develops products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, wearables, and in-home devices.', 'https://www.meta.com', 73000, 2004, 'Menlo Park, CA', 'Mark Zuckerberg', 1300000000000),
('JPMorgan Chase & Co.', 'JPM', 'Financial Services', 'Banks', 'JPMorgan Chase & Co. operates as a financial services company worldwide.', 'https://www.jpmorganchase.com', 309926, 1799, 'New York, NY', 'Jamie Dimon', 570000000000),
('Johnson & Johnson', 'JNJ', 'Healthcare', 'Drug Manufacturers', 'Johnson & Johnson, together with its subsidiaries, researches and develops, manufactures, and sells various products in the healthcare field.', 'https://www.jnj.com', 152700, 1886, 'New Brunswick, NJ', 'Joaquin Duato', 380000000000),
('Visa Inc.', 'V', 'Financial Services', 'Credit Services', 'Visa Inc. operates as a payments technology company worldwide.', 'https://www.visa.com', 26500, 1958, 'San Francisco, CA', 'Ryan McInerney', 560000000000)
ON CONFLICT (ticker) DO NOTHING;
