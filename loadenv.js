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
  NEXT_PUBLIC_SUPABASE_URL: existingEnv.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-url.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: existingEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
  ANTHROPIC_API_KEY: existingEnv.ANTHROPIC_API_KEY || '',
  GOOGLE_AI_API_KEY: existingEnv.GOOGLE_AI_API_KEY || ''
};

// Only write to .env if it doesn't exist or is empty
if (!fs.existsSync('.env') || fs.readFileSync('.env', 'utf8').trim() === '') {
  const envContent = Object.entries(requiredEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync('.env', envContent);
  console.log('Created .env file with default values');
}

// Check if .env.local exists, if not create it with instructions
if (!fs.existsSync('.env.local')) {
  const envLocalContent = `# Supabase Configuration
# Replace these with your actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI API Keys (Optional - for AI features)
ANTHROPIC_API_KEY=
GOOGLE_AI_API_KEY=

# Collaboration WebSocket URL (Optional)
NEXT_PUBLIC_COLLABORATION_WS_URL=`;

  fs.writeFileSync('.env.local', envLocalContent);
  console.log('Created .env.local file - edit this file with your actual credentials');
}

// Log status of environment variables
console.log('\n=== Environment Configuration Status ===');
Object.entries(requiredEnv).forEach(([key, value]) => {
  if (!value || value.includes('your-project-url') || value.includes('your-anon-key')) {
    console.warn(`⚠️  ${key}: Not configured (using placeholder)`);
  } else {
    console.log(`✅ ${key}: Configured`);
  }
});

console.log('\n💡 To enable authentication:');
console.log('1. Create a Supabase project at https://supabase.com');
console.log('2. Edit .env.local with your actual Supabase URL and anon key');
console.log('3. Restart the development server\n');