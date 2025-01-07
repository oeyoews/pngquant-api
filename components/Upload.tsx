// @ts-nocheck
'use client'

import { toast } from 'sonner';
import { handleImageCopy } from '@/utils/CopyImage';
import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'sonner';

interface ImageRes {
  data: {
    newsize: number;
    oldfilesize: number
    base64Image: string
  },
  filename: string
}

const ImageCompressor = () => {
  const [originalSize, setOriginalSize] = useState(null);
  const [newSize, setNewSize] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [originalName, setOriginalName] = useState(`${Date.now()}图片.png`);
  const uploadRef = useRef(null);

  const compressionRate = originalSize && newSize
    ? (((originalSize - newSize) / originalSize) * 100).toFixed(2)
    : 0;

  const sizeReduced = originalSize && newSize
    ? (originalSize - newSize).toFixed(2)
    : 0;

  const beforeUpload = async (file) => {
    // debugger
    if (!file) return;

    // setOriginalSize(file.size / 1024)); // KB

    const formData = new FormData();
    formData.append('file', file);
    const promise = fetch('/api/compress', {
      method: 'POST',
      body: formData,
    });

    toast.promise(promise, {
      loading: '图片压缩中...',
      success: async (res) => {
        const data = await res.json()
        handleSuccess(data);
        return `图片压缩成功`;
      },
      error: (error) => {
        // handleError(error);
        return `压缩失败:${error.message}`;
      },
    });
  };

  const handleSuccess = (res: ImageRes) => {
    if(res.data.message) {
      toast.warning(res.data.message);
      return
    }
    setOriginalSize(res.data?.oldfilesize);
    setNewSize(res.data.newsize);
    setImageSrc(res.data.base64Image);
    setOriginalName(res.filename);
  };

  const handleError = () => {
    toast.error("图片压缩失败");
  };

  const handlePaste = async (event) => {
    const clipboardItems = event.clipboardData.items;
    for (const item of clipboardItems) {
      if (item.type.startsWith('image/png')) {
        const file = item.getAsFile();
        setOriginalSize((file.size / 1024).toFixed(2)); // KB

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/compress', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        // setNewSize(result.size);
        // setImageSrc(result.data);
        handleSuccess(result, file);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  return (
    <div className="mt-5">
      <h2 className="text-center text-lg font-bold">在线图片压缩</h2>

      <div className="w-full min-w-[250px] max-w-md mx-auto mt-4 border border-dashed border-gray-300 p-4 rounded-lg">
        <input
          type="file"
          accept=".png"
          className="hidden"
          ref={uploadRef}
          onChange={(e) => beforeUpload(e.target.files[0])}
        />

        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => uploadRef.current.click()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            className="text-gray-500"
          >
            <path
              fill="currentColor"
              d="M16 4c-4.12 0-7.36 3.13-7.813 7.125a4.9 4.9 0 0 0-3.843 3.22C1.884 15.054 0 17.248 0 20c0 3.324 2.676 6 6 6h20c3.324 0 6-2.676 6-6c0-1.76-.855-3.336-2.094-4.438c-.232-3.514-3.035-6.318-6.562-6.5C22.14 6.133 19.378 4 16 4m0 2c2.762 0 4.97 1.77 5.75 4.28l.22.72H23c2.755 0 5 2.245 5 5v.5l.406.313A4.07 4.07 0 0 1 30 20c0 2.276-1.724 4-4 4H6c-2.276 0-4-1.724-4-4c0-2.02 1.45-3.588 3.28-3.906l.657-.125l.125-.658C6.362 13.964 7.556 13 9 13h1v-1c0-3.37 2.63-6 6-6m0 5.594l-.72.687l-4 4l1.44 1.44L15 15.437V22h2v-6.563l2.28 2.282l1.44-1.44l-4-4z"
            />
          </svg>
          <div className="text-sm text-gray-500 mt-2">拖动/粘贴/点击上传图片</div>
        </div>
      </div>

      {originalSize && newSize && (
        <div className="text-center mt-4 text-sm text-gray-500">
          大小: {originalSize} KB → {newSize} KB | 压缩率为: {compressionRate}% | 压缩大小: {sizeReduced} KB
        </div>
      )}

      {imageSrc && (
        <div className="text-center mt-4">
          <img
            src={imageSrc}
            alt="压缩结果"
            className="rounded-lg max-h-80 mx-auto"
          />
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={() => handleImageCopy(imageSrc)}
            >
              复制图片
            </button>
            <button
              className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              onClick={() => {
                const a = document.createElement('a');
                a.href = imageSrc;
                a.download = originalName;
                a.click();
              }}
            >
              下载图片
            </button>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default ImageCompressor;
