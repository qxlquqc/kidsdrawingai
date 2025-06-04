import { validateServerEnv } from '../lib/env';

process.env.REPLICATE_API_TOKEN = 'r8_validtokenstring12345678901234';
const result = validateServerEnv();
if (!result.valid) {
  console.error('Expected valid configuration but got invalid');
  process.exit(1);
}

delete process.env.REPLICATE_API_TOKEN;
const missing = validateServerEnv();
if (missing.valid || missing.missingVars.length === 0) {
  console.error('Expected missing configuration to be invalid');
  process.exit(1);
}

console.log('env.test passed');
