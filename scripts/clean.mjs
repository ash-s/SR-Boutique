import fs from "fs";
import path from "path";

const dirs = [".next", "node_modules/.cache"];

for (const dir of dirs) {
  const full = path.join(process.cwd(), dir);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true });
    console.log(`Removed ${dir}`);
  }
}

console.log("Cache cleared successfully.");
