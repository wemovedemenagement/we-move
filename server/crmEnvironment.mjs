import { config } from 'dotenv';
// Local configuration only; deployment uses its runtime environment and ADC.
if (!process.env.K_SERVICE) config({ path: '.env.local', quiet: true });
