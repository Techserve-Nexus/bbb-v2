-- Add email logs table if not exists
CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  registration_id VARCHAR(50) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (registration_id) REFERENCES registrations(registration_id)
);

-- Add attendance tracking table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  registration_id VARCHAR(50) NOT NULL,
  checked_in_at TIMESTAMP,
  checked_in_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (registration_id) REFERENCES registrations(registration_id),
  UNIQUE(registration_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_registration_id ON email_logs(registration_id);
CREATE INDEX IF NOT EXISTS idx_attendance_registration_id ON attendance(registration_id);
