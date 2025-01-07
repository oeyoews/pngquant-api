import path from 'path';
import fs from "fs";

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


/**
 * Converts a file at the given path to a Base64 encoded string and returns its size.
 *
 * @param {string} path - The path of the file to be converted.
 * @returns {Promise<{base64Image: string, newsize: string} | {message: string} | null>}
 *   - An object containing the Base64 encoded string and file size in kilobytes,
 *     or an error message if the file does not exist, or null if an error occurs.
 */

export async function handleFileConversion(path) {
  try {
    // 获取文件状态
    const stats = await fs.promises.stat(path);

    // 读取文件数据
    const fileData = await fs.promises.readFile(path);

    // 将文件转换为 Base64
    const base64Image = `data:image/png;base64,${fileData.toString('base64')}`;
    const newsize = (stats.size / 1024).toFixed(2); // 文件大小（KB）

    // 返回文件大小和 Base64 数据
    return { base64Image, newsize };
  } catch (error) {
    if (!fs.existsSync(path)) {
      return {
        message: "压缩文件不存在",
      }
    }
    console.error('Error handling file:', error);
    return null;
  }
}


/**
 * A wrapper for the child process that runs the PNGQuant compression,
 * provides a promise interface and cleans up temporary files.
 *
 * @param {ChildProcess} child - The child process.
 * @param {string} compressedFilepath - The path of the compressed file.
 * @param {string} filePath - The path of the source file.
 * @param {string} filename - The name of the file.
 * @returns {Promise<{filename: string, data: {base64Image: string, newsize: string}} | Error>}
 */
export function processCompression(child, compressedFilepath, filePath, filename, oldfilesize) {
  return new Promise((resolve, reject) => {
    child.on('close', async () => {
      try {
        console.log('[pngquant]图片压缩成功', compressedFilepath);

        const filedata = await handleFileConversion(compressedFilepath);

        // 临时文件清理
        [compressedFilepath, filePath].forEach((file) => {
          fs.rm(file, () => {
            console.log('[clean]清理临时文件', file);
          });
        });

        // 返回数据
        resolve({
          filename,
          data: {
            ...filedata, // 原始文件数据
            oldfilesize
          },
        });
      } catch (error) {
        console.error('Error during compression process:', error);
        reject(error);
      }
    });

    child.on('error', (error) => {
      console.error('Error in child process:', error);
      reject(error);
    });
  });
}