import fs from 'fs';

const data = JSON.parse(fs.readFileSync('eslint_report.json', 'utf8'));
const filesWithErrors = data.filter(file => file.errorCount > 0 || file.warningCount > 0);

console.log(`Files with lint issues: ${filesWithErrors.length}`);
filesWithErrors.forEach(file => {
  console.log(`\n${file.filePath}`);
  file.messages.forEach(msg => {
    console.log(`  Line ${msg.line}: ${msg.message} (${msg.ruleId})`);
  });
});
