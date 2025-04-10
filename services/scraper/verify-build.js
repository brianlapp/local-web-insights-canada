import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Build Verification ===');

// Check dist directory
const distPath = join(__dirname, 'dist');
console.log('Checking dist directory:', distPath);

try {
  const files = readdirSync(distPath);
  console.log('Found files:', files);

  // Check index.js
  const indexPath = join(distPath, 'index.js');
  const indexContent = readFileSync(indexPath, 'utf8');
  console.log('index.js exists:', indexContent.length > 0 ? 'Yes' : 'No');
  
  // Check package.json
  const pkgPath = join(distPath, 'package.json');
  const pkgContent = JSON.parse(readFileSync(pkgPath, 'utf8'));
  console.log('package.json exists:', pkgContent.type === 'module' ? 'Yes (ES modules)' : 'No');

} catch (error) {
  console.error('Verification failed:', error);
  process.exit(1);
} 