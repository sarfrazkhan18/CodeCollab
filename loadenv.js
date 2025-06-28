const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Check for .env.local first (dev environment)
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

// Prioritize .env.local for development
let envFound = false;

// Load .env.local if it exists (preferred for development)
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  envFound = true;
  console.log('Using configuration from .env.local');
} 

// Fall back to .env if .env.local doesn't exist
if (!envFound && fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  envFound = true;
  console.log('Using configuration from .env');
}

// Environment variables may also come from GitHub Actions or Netlify
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check configuration status
console.log('\n=== Environment Configuration Status ===');

// Check if we have Supabase credentials
if (!supabaseUrl || supabaseUrl.includes('your-project-url')) {
  console.warn('⚠️  Supabase URL: Not configured');
} else {
  console.log('✅ Supabase URL: Configured');
}

if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon-key')) {
  console.warn('⚠️  Supabase Anon Key: Not configured');
} else {
  console.log('✅ Supabase Anon Key: Configured');
}

// Other optional configurations
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ Supabase Service Role Key: Configured');
} else {
  console.log('ℹ️  Supabase Service Role Key: Not configured (optional)');
}

// Check for AI API keys
if (process.env.ANTHROPIC_API_KEY) {
  console.log('✅ Anthropic API Key: Configured');
} else {
  console.log('ℹ️  Anthropic API Key: Not configured (optional for AI features)');
}

if (process.env.GOOGLE_AI_API_KEY) {
  console.log('✅ Google AI API Key: Configured');
} else {
  console.log('ℹ️  Google AI API Key: Not configured (optional for AI features)');
}

// Provide instructions if no configuration is found
if (!envFound) {
  console.log('\n🔧 No configuration found. Choose one of these options:');
  console.log('1. Run "node scripts/setup-local-env.js" to set up your local environment');
  console.log('2. Set environment variables in your CI/CD platform');
  console.log('3. Create a .env.local file manually with your Supabase credentials');
}

console.log('\n💡 If using GitHub for deployment:');
console.log('1. Add your Supabase credentials as GitHub Secrets');
console.log('2. The CI/CD workflow will automatically use these secrets');