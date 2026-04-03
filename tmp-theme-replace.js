import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (/\.(tsx|ts|jsx|js|html)$/.test(dirFile)) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const mapColors = (content) => {
  let newContent = content;
  // Deep Greens
  newContent = newContent.replace(/emerald-900/g, 'nutri-forest');
  newContent = newContent.replace(/emerald-800/g, 'nutri-forest');
  newContent = newContent.replace(/emerald-700/g, 'nutri-forest');
  
  // Mid Greens
  newContent = newContent.replace(/emerald-600/g, 'nutri-emerald');
  newContent = newContent.replace(/emerald-500/g, 'nutri-green');
  
  // Light Greens
  newContent = newContent.replace(/emerald-400/g, 'nutri-lime');
  
  // Let's also use Orange somewhere. E.g. replacing some secondary actions or yellow/amber badges
  newContent = newContent.replace(/amber-600/g, 'nutri-orange');
  newContent = newContent.replace(/amber-500/g, 'nutri-orange');
  newContent = newContent.replace(/amber-700/g, 'nutri-orangeAlt');
  newContent = newContent.replace(/yellow-600/g, 'nutri-orange');
  newContent = newContent.replace(/yellow-500/g, 'nutri-orange');
  newContent = newContent.replace(/yellow-700/g, 'nutri-orangeAlt');

  // Any primary specific usage? Primary buttons often use bg-black or bg-emerald
  // The user says "TODA la pagina deberia variarse con estos colores"
  // Let's replace 'bg-black' on Buttons and headers with 'bg-nutri-forest' or 'bg-nutri-emerald' to introduce brand color!
  newContent = newContent.replace(/bg-black hover:bg-gray-800/g, 'bg-nutri-forest hover:bg-nutri-emerald');
  newContent = newContent.replace(/text-gray-900/g, 'text-nutri-forest');
  newContent = newContent.replace(/text-zinc-900/g, 'text-nutri-forest');

  return newContent;
};

const files = walkSync(srcDir);
let changedCount = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const newContent = mapColors(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedCount++;
  }
}

console.log(`Replaced colors in ${changedCount} files.`);
