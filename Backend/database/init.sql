CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  avatar_url TEXT,
  avatar_tone VARCHAR(10),
  university VARCHAR(255),
  career VARCHAR(255),
  reminder_enabled BOOLEAN DEFAULT false,
  reminder_time VARCHAR(5),
  reminder_frequency VARCHAR(40),
  reminder_channel VARCHAR(20),
  risk_alert_dismissed_until DATE,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  emotion_score INTEGER NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT emotion_logs_score_check CHECK (emotion_score BETWEEN 1 AND 5),
  CONSTRAINT emotion_logs_user_date_unique UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title VARCHAR(160) NOT NULL,
  frequency VARCHAR(40) NOT NULL,
  cue VARCHAR(255),
  color VARCHAR(10),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  CONSTRAINT habit_logs_habit_date_unique UNIQUE (habit_id, date)
);

CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emotion_level INTEGER NOT NULL,
  title VARCHAR(160) NOT NULL,
  content TEXT NOT NULL,
  action TEXT,
  category VARCHAR(80) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT recommendations_emotion_level_check CHECK (emotion_level BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS emotion_logs_user_date_idx
  ON emotion_logs (user_id, date DESC);

CREATE INDEX IF NOT EXISTS habits_user_idx
  ON habits (user_id);

CREATE INDEX IF NOT EXISTS habit_logs_user_completed_idx
  ON habit_logs (user_id, date DESC);

CREATE INDEX IF NOT EXISTS habit_logs_habit_date_idx
  ON habit_logs (habit_id, date DESC);
