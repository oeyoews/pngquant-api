/**
 * 将 base64 字符串转换为 Blob 对象
 * @param {string} base64 - base64 字符串
 * @param {string} [mimeType=''] - Blob 对象的 MIME 类型
 * @returns {Blob}
 */
export const base64ToBlob = (base64: string, mimeType = '') => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Copies an image to the clipboard.
 *
 * @param {string} src - The base64 encoded string of the image to be copied.
 *
 * This function converts a base64 encoded image string to a Blob and writes it to the clipboard
 * as a 'image/png' ClipboardItem. It notifies the user of success or failure using ElNotification.
 */
export const handleImageCopy = async (src: string) => {
  if (!src) {
    console.error("图片不存在");
    return;
  }
  try {
    const clipboardItem = new ClipboardItem({
      'image/png': base64ToBlob(
        src.replace('data:image/png;base64,', ''),
        'image/png'
      ),
    });
    await navigator.clipboard.write([clipboardItem]);
    // ElNotification({ type: 'success', message: '图片已复制到剪贴板' });
  } catch (error) {
    console.error('复制失败:', error);
    // ElNotification({ type: 'error', message: '复制失败，请重试' });
  }
};