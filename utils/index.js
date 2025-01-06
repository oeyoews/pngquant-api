import path from 'path';

export const countFilesize = (size) => (size / 1024).toFixed(2);

export const generateNewFilename = (filename) => {
  const extname = path.extname(filename);
  const basename = path.basename(filename, extname);
  return basename + '-' + Date.now() + extname;
};

export const checkDir = (dir) => {
  if (!fs.existsSync(dir)) {
    console.log('创建目录', dir);
    fs.mkdirSync(dir, { recursive: true });
  }
};


// 转换 __dirname
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
