/* 构建脚本：将 src/ 按序拼接为单文件 index.html */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'index.html');
const FILES = [
  '00_head.html',
  '01_core.js',
  '02_data_sects.js',
  '03_data_items.js',
  '04_data_world.js',
  '05_gen.js',
  '06_state.js',
  '07_battle.js',
  '08_systems.js',
  '09_ui.js',
  '10_main.js',
  '99_tail.html'
];

let out = '';
for (const f of FILES) {
  const p = path.join(SRC, f);
  if (!fs.existsSync(p)) { console.error('缺少文件: ' + f); process.exit(1); }
  out += fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  if (!out.endsWith('\n')) out += '\n';
}

// 语法检查：提取 <script> 内容写入临时文件，交给 node --check
const m = out.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.error('未找到 <script> 块'); process.exit(1); }
const tmp = path.join(__dirname, '.build-check.js');
fs.writeFileSync(tmp, m[1]);
const { execFileSync } = require('child_process');
try {
  execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
  console.log('语法检查通过');
} catch (e) {
  console.error('语法检查失败:\n' + (e.stderr ? e.stderr.toString() : e.message));
  fs.unlinkSync(tmp);
  process.exit(1);
}
fs.unlinkSync(tmp);

fs.writeFileSync(OUT, out);
const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log(`构建完成: index.html (${kb} KB)`);
