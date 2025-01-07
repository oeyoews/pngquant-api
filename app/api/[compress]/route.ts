// @ts-nocheck
import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawn } from 'child_process';
import pngquant from 'pngquant-bin';

import { writeFile } from 'fs/promises';
import { checkDir, countFilesize, generateNewFilename, handleFileConversion, processCompression } from '@/utils/index';

const MAXSIZE = 1024 * 3;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ compress: string }> }
) {
  try {
    // 获取表单数据
    // TODO: 不支持中文文件名上传 ???
    // TODO: larger skip
    // add 通知组件
    // 限制api访问
    const formData = await request.formData();
    const file = formData.get('file')!; // 获取文件
    const oldfilesize = countFilesize(file.size);

    if (!file || typeof file === 'string') {
      return Response.json({
        message: 'No file uploaded',
        code: 400,
      });
    }

    // 文件大小限制
    if (countFilesize(file.size) > MAXSIZE) {
      return Response.json({
        message:
          '上传的文件大小为' +
          countFilesize(file.size) +
          'kb' +
          ',请上传小于 3M 的图片',
        code: 500,
      });
    }

    // 文件类型限制 image/png
    if (file.type !== 'image/png') {
      return Response.json({
        message: '请上传PNG图片',
        code: 500,
      });
    }

    // 将文件读取为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filename = generateNewFilename(file.name.replaceAll(' ', ''));
    const uploadDir = os.tmpdir();
    // checkDir(uploadDir);
    const filePath = path.join(uploadDir, filename);
    const compressedFilepath = path.join(uploadDir, 'fs8-' + filename);

    // 文件写入
    await writeFile(filePath, buffer);
    // 图片压缩
    const child = spawn(pngquant, ['--skip-if-larger', '-o', compressedFilepath, filePath]);
    // 处理返回数据
    const data = await processCompression(child, compressedFilepath, filePath, filename, oldfilesize)
    return Response.json(data);
  } catch (error) {
    console.error('Error uploading file:', error);
    return Response.json('Error uploading file', { status: 500 });
  }
}

export function GET(req: Request) {
  return Response.json({
    message: '在线PNG压缩图片API, powered by @oeyoews',
    code: 200,
  });
}
