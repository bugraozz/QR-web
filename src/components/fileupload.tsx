import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUpload: (filePaths: string[]) => void;
}

const convertToJpg = async (file: File): Promise<File> => {
  const image = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx?.drawImage(image, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' }));
        } else {
          reject(new Error('Conversion to JPG failed.'));
        }
      }, 'image/jpeg');
    };
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
};

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      const jpgFiles = await Promise.all(selectedFiles.map(file => convertToJpg(file)));
      setFiles(jpgFiles);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));

    try {
      interface UploadResponse {
        filePaths: string[];
      }

      const response = await axios.post<UploadResponse>('/api/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUpload(response.data.filePaths);
    } catch (error) {
      console.error('Dosya yüklenirken bir hata oluştu:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Input type="file" multiple onChange={handleFileChange} className="file-input w-64" />
      <Button onClick={handleUpload} disabled={uploading} className="bg-blue-500 text-white hover:bg-blue-600">
        {uploading ? (
          <Loader2 className="animate-spin h-5 w-5 mr-2" />
        ) : (
          'Yükle'
        )}
      </Button>
    </div>
  );
};

export default FileUpload;
