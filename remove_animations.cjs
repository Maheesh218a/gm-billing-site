const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const classesToRemove = [
  'transition-all',
  'transition-colors',
  'transition-transform',
  'transition-opacity',
  'duration-200',
  'duration-300',
  'ease-in-out',
  'hover:-translate-y-1',
  'hover:scale-105',
  'hover:scale-110',
  'group-hover:scale-110'
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const cls of classesToRemove) {
        // Regex to replace the exact class name
        const regex = new RegExp('\\b' + cls + '\\b', 'g');
        content = content.replace(regex, '');
      }
      
      // Clean up extra spaces
      content = content.replace(/className=(['"`])\s+/g, 'className=$1');
      content = content.replace(/\s+(['"`])/g, '$1');
      content = content.replace(/\s{2,}/g, ' '); // Be careful with this on non-class strings, but okay for our simple UI
      
      // Actually, regex to clean up double spaces inside className only is safer
      // but a simple replace is fine for this project. Wait, a global replace of \s{2,} might break formatting.
      // Better to not collapse all spaces in the whole file!
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

// Safer replace
function safeProcessDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      safeProcessDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const cls of classesToRemove) {
        const regex = new RegExp('\\b' + cls + '\\b\\s*', 'g');
        if (regex.test(content)) {
          content = content.replace(regex, '');
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

safeProcessDir(srcDir);
console.log('Done!');
