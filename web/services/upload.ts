import axios from 'axios';

export async function uploadFile(file: File, folder?: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder || 'wiki');
  const res = await axios.post<{ url: string }>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}
