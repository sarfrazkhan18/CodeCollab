const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load both .env and .env.local files
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

// Function to read existing env file
const readEnvFile = (filename) => {
  try {
    if (fs.existsSync(filename)) {
      const content = fs.readFileSync(filename, 'utf8');
      return dotenv.parse(content);
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
  }
  return {};
};

// Read existing values
const existingEnv = {
  ...readEnvFile('.env'),
  ...readEnvFile('.env.local') // .env.local takes precedence
};

// Required environment variables - use existing values or defaults
const requiredEnv = {
  NEXT_PUBLIC_SUPABASE_URL: existingEnv.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: existingEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  ANTHROPIC_API_KEY: existingEnv.ANTHROPIC_API_KEY || '',
  GOOGLE_AI_API_KEY: existingEnv.GOOGLE_AI_API_KEY || ''
};

// Only write to .env if it doesn't exist or is empty
if (!fs.existsSync('.env') || fs.readFileSync('.env', 'utf8').trim() === '') {
  const envContent = Object.entries(requiredEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync('.env', envContent);
}

// Log status of environment variables
Object.entries(requiredEnv).forEach(([key, value]) => {
  if (!value) {
    console.warn(`Warning: ${key} is not set`);
  }
});