// @ts-nocheck
import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawn } from 'child_process';
import  pngquant from 'pngquant-bin';

import { writeFile } from 'fs/promises';
import { countFilesize, generateNewFilename } from '@/utils/index';

const MAXSIZE = 1024 * 3;

export async function POST(request: Request) {
  try {
    // 获取表单数据
    // TODO: 不支持中文文件名上传
    const formData = await request.formData();
    const file = formData.get('file')!; // 获取文件

    if (!file || typeof file === 'string') {
      return new Response('No file uploaded', { status: 400 });
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

    await writeFile(filePath, buffer);
	const child = spawn(pngquant, ['-o', 'test-fs8.png', filePath])
	  child.on('close', () => {
		console.log("'成功");
	})

    setTimeout(() => {
      fs.rm(filePath, () => {
        console.log('自动清理上传的临时图片文件', filePath);
      });
    }, 1500);

    console.log('File saved to', filePath);

    return Response.json({
      filename,
      filepath: filePath,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return Response.json('Error uploading file', { status: 500 });
  }
}
