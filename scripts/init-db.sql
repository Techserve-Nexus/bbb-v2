-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  registration_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  chapter_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  contact_no VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  ticket_type VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(100),
  payment_reference VARCHAR(100),
  spouse_name VARCHAR(255),
  children_data JSONB,
  participations JSONB,
  conclave_groups JSONB,
  qr_code TEXT,
  ticket_pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email, ticket_type)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  registration_id VARCHAR(50) NOT NULL,
  razorpay_order_id VARCHAR(100) NOT NULL,
  razorpay_payment_id VARCHAR(100),
  amount INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (registration_id) REFERENCES registrations(registration_id)
);

-- Create sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT NOT NULL,
  website VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  social_links JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  tags JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_id ON registrations(registration_id);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_registration_id ON payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_category ON sponsors(category);
