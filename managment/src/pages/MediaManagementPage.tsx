import React, { useState, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Folder, 
  File, 
  Upload, 
  Search, 
  Grid, 
  List, 
  MoreVertical, 
  Download, 
  Edit, 
  Trash2, 
  Image, 
  FileText, 
  Video, 
  Music, 
  Archive,
  X,
  FolderPlus,
  FilePlus,
  Eye,
  Play
} from 'lucide-react';

// Tip tanımları - Base64 desteği eklendi
interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  uploadDate: string;
  folderId?: string;
  description?: string;
  base64Data: string; // Base64 veri eklendi
  downloadCount?: number;
}

interface MediaFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  fileCount: number;
  totalSize: number;
  createdAt: string;
}

// Modern Modal Bileşeni
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isOpen, onClose, children, title, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className={`relative w-full ${sizeClasses[size]} bg-white rounded-xl shadow-2xl`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dosya Önizleme Bileşeni
const FilePreview: React.FC<{ file: MediaFile }> = ({ file }) => {
  const getFileType = (type: string) => {
    return type.split('/')[0]; // 'image', 'video', 'application' vb.
  };

  const renderPreview = () => {
    const fileType = getFileType(file.type);

    if (fileType === 'image') {
      return (
        <div className="text-center">
          <img 
            src={file.base64Data} 
            alt={file.name}
            className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
          />
          <p className="text-sm text-gray-500 mt-2">
            {file.originalName} • {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      );
    }

    if (fileType === 'video') {
      return (
        <div className="text-center">
          <video 
            controls 
            className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
          >
            <source src={file.base64Data} type={file.type} />
            Tarayıcınız video oynatmayı desteklemiyor.
          </video>
          <p className="text-sm text-gray-500 mt-2">
            {file.originalName} • {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      );
    }

    if (fileType === 'audio') {
      return (
        <div className="text-center">
          <audio 
            controls 
            className="w-full max-w-md mx-auto"
          >
            <source src={file.base64Data} type={file.type} />
            Tarayıcınız ses oynatmayı desteklemiyor.
          </audio>
          <p className="text-sm text-gray-500 mt-2">
            {file.originalName} • {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      );
    }

    // PDF ve diğer dosyalar için
    if (file.type.includes('pdf')) {
      return (
        <div className="text-center">
          <div className="bg-gray-100 p-8 rounded-lg">
            <FileText className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">PDF Dosyası</p>
            <p className="text-sm text-gray-500 mb-4">
              {file.originalName} • {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <a 
              href={file.base64Data} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              PDF'i Aç
            </a>
          </div>
        </div>
      );
    }

    // Genel dosya önizleme
    return (
      <div className="text-center">
        <div className="bg-gray-100 p-8 rounded-lg">
          <File className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">{file.name}</p>
          <p className="text-sm text-gray-500 mb-4">
            {file.originalName} • {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
          </p>
          <p className="text-sm text-gray-600">
            Bu dosya türü için önizleme mevcut değil. İndirerek görüntüleyebilirsiniz.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{file.name}</h3>
        {file.description && (
          <p className="text-gray-600">{file.description}</p>
        )}
      </div>
      
      {renderPreview()}
      
      <div className="flex justify-center space-x-3 pt-4">
        <button
          onClick={() => {
            const link = document.createElement('a');
            link.href = file.base64Data;
            link.download = file.originalName;
            link.click();
          }}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          İndir
        </button>
      </div>
    </div>
  );
};

// Gelişmiş Dosya Yükleme Bileşeni - DÜZELTİLDİ
const FileUpload: React.FC<{
  onFileUpload: (file: File, folderId?: string, description?: string) => void;
  folders: MediaFolder[];
  currentFolderId?: string;
}> = ({ onFileUpload, folders, currentFolderId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(currentFolderId || '');
  const [description, setDescription] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      // Dosya boyutu kontrolü (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        alert('Dosya boyutu 50MB\'dan büyük olamaz!');
        return;
      }

      // Dosya türü kontrolü
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'application/zip', 'application/x-rar-compressed'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Bu dosya türü desteklenmiyor!');
        return;
      }

      await onFileUpload(file, selectedFolderId || undefined, description);
      setFile(null);
      setDescription('');
      setSelectedFolderId(currentFolderId || '');
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      alert('Dosya yüklenirken hata oluştu!');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      
      // Dosya türü kontrolü
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'application/zip', 'application/x-rar-compressed'
      ];

      if (!allowedTypes.includes(droppedFile.type)) {
        alert('Bu dosya türü desteklenmiyor!');
        return;
      }

      if (droppedFile.size > 50 * 1024 * 1024) {
        alert('Dosya boyutu 50MB\'dan büyük olamaz!');
        return;
      }

      setFile(droppedFile);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Dosya Yükle</h3>
      
      {/* Klasör Seçimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hedef Klasör
        </label>
        <select
          value={selectedFolderId}
          onChange={(e) => setSelectedFolderId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Ana Klasör</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              📁 {folder.name}
            </option>
          ))}
        </select>
      </div>

             {/* Sürükle-Bırak Alanı */}
       <div
         className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
           dragOver 
             ? 'border-blue-400 bg-blue-50' 
             : 'border-gray-300 hover:border-gray-400'
         }`}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}
         onDragEnter={(e) => e.preventDefault()}
       >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            Dosyayı buraya sürükleyin
          </p>
          <p className="text-sm text-gray-500">veya</p>
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Dosya Seç
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Desteklenen formatlar: JPG, PNG, WebP, GIF, PDF, DOC, XLS, TXT, ZIP, RAR (Max: 50MB)
        </p>
      </div>

      {/* Seçilen Dosya Bilgisi */}
      {file && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Açıklama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Açıklama
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Dosya açıklaması..."
        />
      </div>

      {/* Yükle Butonu */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
          file && !uploading
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {uploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Yükleniyor...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Dosyayı Yükle
          </>
        )}
      </button>
    </div>
  );
};





// Sürüklenebilir Klasör Bileşeni
const DraggableFolder: React.FC<{
  folder: MediaFolder;
  index: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  onSelect: (folderId: string) => void;
  onEdit: (folder: MediaFolder) => void;
  onDelete: (folderId: string) => void;
  onDropFile: (fileId: string, newFolderId: string) => void;
  isSelected: boolean;
}> = ({ folder, index, onMove, onSelect, onEdit, onDelete, onDropFile, isSelected }) => {
  const [showMenu, setShowMenu] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'FOLDER',
    item: { index, id: folder.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ['FOLDER', 'FILE'],
    hover: (item: { index?: number; id: string; folderId?: string }) => {
      if (item.index !== undefined && item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
    drop: (item: { id: string; folderId?: string; index?: number }) => {
      if (item.folderId !== undefined && item.index === undefined) {
        // Dosya bırakıldı - klasöre taşı
        onDropFile(item.id, folder.id);
      }
    },
  });

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      onClick={() => onSelect(folder.id)}
      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${folder.color}`}>
            <Folder className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{folder.name}</h4>
            <p className="text-sm text-gray-500">
              {folder.fileCount} dosya • {(folder.totalSize / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        
        {/* Menü Butonu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Dropdown Menü */}
      {showMenu && (
        <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(folder);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(folder.id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sürüklenebilir Dosya Bileşeni - DÜZELTİLDİ
const DraggableFile: React.FC<{
  file: MediaFile;
  onMove: (fileId: string, newFolderId: string) => void;
  onEdit: (file: MediaFile) => void;
  onDelete: (fileId: string) => void;
  onDownload: (file: MediaFile) => void;
  onPreview: (file: MediaFile) => void;
  folders: MediaFolder[];
}> = ({ file, onMove, onEdit, onDelete, onDownload, onPreview, folders }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="h-8 w-8 text-red-500" />;
    if (type.startsWith('audio/')) return <Music className="h-8 w-8 text-yellow-500" />;
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-green-500" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-8 w-8 text-orange-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const [{ isDragging }, drag] = useDrag({
    type: 'FILE',
    item: { id: file.id, folderId: file.folderId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div 
      ref={(node) => {
        if (node) drag(node);
      }}
      className={`group relative p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-all cursor-pointer ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Dosya İçeriği */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Thumbnail veya İkon */}
          {file.type.startsWith('image/') ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img 
                src={file.base64Data} 
                alt={file.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            getFileIcon(file.type)
          )}
          
          <div>
            <h4 className="font-medium text-gray-900 truncate max-w-48" title={file.name}>
              {file.name}
            </h4>
            <p className="text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.uploadDate}
            </p>
            {file.downloadCount && (
              <p className="text-xs text-gray-400">
                {file.downloadCount} kez indirildi
              </p>
            )}
          </div>
        </div>
        
        {/* Menü Butonu */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
        >
          <MoreVertical className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Dropdown Menü */}
      {showMenu && (
        <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="py-1">
                         <button
               onClick={(e) => {
                 e.stopPropagation();
                 onPreview(file);
                 setShowMenu(false);
               }}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
             >
               <Eye className="h-4 w-4 mr-2" />
               Önizle
             </button>
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onDownload(file);
                 setShowMenu(false);
               }}
               className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
             >
               <Download className="h-4 w-4 mr-2" />
               İndir
             </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoveMenu(true);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Folder className="h-4 w-4 mr-2" />
              Taşı
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(file);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file.id);
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </button>
          </div>
        </div>
      )}

      {/* Taşıma Menüsü */}
      {showMoveMenu && (
        <div className="absolute right-0 top-12 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <p className="text-xs font-medium text-gray-700 mb-2 px-2">Klasöre Taşı:</p>
            <div className="max-h-32 overflow-y-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(file.id, '');
                  setShowMoveMenu(false);
                }}
                className="w-full px-2 py-1 text-left text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                📁 Ana Klasör
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(file.id, folder.id);
                    setShowMoveMenu(false);
                  }}
                  className="w-full px-2 py-1 text-left text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  📁 {folder.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Ana Medya Yönetim Sayfası
const MediaManagementPage: React.FC = () => {
  console.log('MediaManagementPage rendered!'); // Debug log
  
  // State management
  const [folders, setFolders] = useState<MediaFolder[]>([
    {
      id: '1',
      name: 'Projeler',
      description: 'Proje dosyaları',
      color: 'bg-blue-100',
      fileCount: 0,
      totalSize: 0,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Sözleşmeler',
      description: 'Müşteri sözleşmeleri',
      color: 'bg-green-100',
      fileCount: 0,
      totalSize: 0,
      createdAt: '2024-01-01'
    }
  ]);
  
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaFile | MediaFolder | null>(null);
  
  // Form states
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('bg-blue-100');

  // Klasör oluşturma
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder: MediaFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      description: newFolderDescription.trim(),
      color: newFolderColor,
      fileCount: 0,
      totalSize: 0,
      createdAt: new Date().toISOString()
    };
    
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setNewFolderDescription('');
    setNewFolderColor('bg-blue-100');
    setIsFolderModalOpen(false);
  };

  // Klasör silme
  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm('Bu klasörü silmek istediğinizden emin misiniz?')) {
      setFolders(folders.filter(f => f.id !== folderId));
      setFiles(files.filter(f => f.folderId !== folderId));
    }
  };

  // Klasör taşıma
  const handleMoveFolder = (fromIndex: number, toIndex: number) => {
    const newFolders = [...folders];
    const [movedFolder] = newFolders.splice(fromIndex, 1);
    newFolders.splice(toIndex, 0, movedFolder);
    setFolders(newFolders);
  };

  // Dosya yükleme - DÜZELTİLDİ
  const handleFileUpload = async (file: File, folderId?: string, description?: string) => {
    try {
      // Dosyayı Base64'e çevir - Bu dosya bozulmasını önler
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Dosya okunamadı'));
          }
        };
        reader.onerror = () => reject(new Error('Dosya okuma hatası'));
        reader.readAsDataURL(file);
      });

      const newFile: MediaFile = {
        id: Date.now().toString(),
        name: file.name.split('.')[0],
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toLocaleDateString('tr-TR'),
        folderId: folderId || currentFolderId || '',
        description: description || '',
        base64Data: base64Data, // Base64 veriyi sakla
        downloadCount: 0
      };
      
      setFiles([...files, newFile]);
      
             // Klasör istatistiklerini güncelle - Artık dinamik hesaplandığı için gerek yok
       // Ancak localStorage'da saklamak için güncelleyelim
       if (folderId || currentFolderId) {
         const targetFolderId = folderId || currentFolderId;
         setFolders(folders.map(f => 
           f.id === targetFolderId 
             ? { ...f, fileCount: f.fileCount + 1, totalSize: f.totalSize + file.size }
             : f
         ));
       }

      // Başarı mesajı
      alert(`${file.name} başarıyla yüklendi!`);
      
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      alert('Dosya yüklenirken hata oluştu: ' + (error as Error).message);
    }
  };

  // Dosya taşıma - DÜZELTİLDİ
  const handleMoveFile = (fileId: string, newFolderId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    const oldFolderId = file.folderId;
    
    // Dosyayı taşı - Sadece folderId'yi güncelle, dosyayı çoğaltma
    setFiles(files.map(f => 
      f.id === fileId ? { ...f, folderId: newFolderId } : f
    ));
    
         // Eski klasör istatistiklerini güncelle - Artık dinamik hesaplandığı için gerek yok
     // Ancak localStorage'da saklamak için güncelleyelim
     if (oldFolderId) {
       setFolders(folders.map(f => 
         f.id === oldFolderId 
           ? { ...f, fileCount: Math.max(0, f.fileCount - 1), totalSize: Math.max(0, f.totalSize - file.size) }
           : f
       ));
     }
     
     // Yeni klasör istatistiklerini güncelle - Artık dinamik hesaplandığı için gerek yok
     // Ancak localStorage'da saklamak için güncelleyelim
     if (newFolderId) {
       setFolders(folders.map(f => 
         f.id === newFolderId 
           ? { ...f, fileCount: f.fileCount + 1, totalSize: f.totalSize + file.size }
           : f
       ));
     }
    
    // Başarı mesajı
    const oldFolderName = oldFolderId ? folders.find(f => f.id === oldFolderId)?.name || 'Ana Klasör' : 'Ana Klasör';
    const newFolderName = newFolderId ? folders.find(f => f.id === newFolderId)?.name : 'Ana Klasör';
    
    alert(`${file.name} dosyası ${oldFolderName} klasöründen ${newFolderName} klasörüne başarıyla taşındı!`);
  };

  // Dosya silme - DÜZELTİLDİ
  const handleDeleteFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    if (window.confirm(`"${file.name}" dosyasını silmek istediğinizden emin misiniz?`)) {
      // Dosyayı tamamen kaldır
      setFiles(files.filter(f => f.id !== fileId));
      
             // Klasör istatistiklerini güncelle - Artık dinamik hesaplandığı için gerek yok
       // Ancak localStorage'da saklamak için güncelleyelim
       if (file.folderId) {
         setFolders(folders.map(f => 
           f.id === file.folderId 
             ? { ...f, fileCount: Math.max(0, f.fileCount - 1), totalSize: Math.max(0, f.totalSize - file.size) }
             : f
         ));
       }
      
      alert(`${file.name} dosyası başarıyla silindi!`);
    }
  };

  // Dosya indirme - DÜZELTİLDİ
  const handleDownloadFile = (file: MediaFile) => {
    try {
      if (file.base64Data) {
        // Base64 veriyi kullanarak dosyayı indir
        const link = document.createElement('a');
        link.href = file.base64Data;
        link.download = file.originalName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // İndirme sayısını güncelle
        setFiles(files.map(f => 
          f.id === file.id 
            ? { ...f, downloadCount: (f.downloadCount || 0) + 1 }
            : f
        ));
        
        alert(`${file.originalName} başarıyla indirildi!`);
      } else {
        // Eski dosyalar için fallback
        alert('Bu dosya için indirme verisi bulunamadı. Lütfen dosyayı tekrar yükleyin.');
      }
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      alert('Dosya indirilirken hata oluştu: ' + (error as Error).message);
    }
  };

  // Düzenleme
  const handleEdit = (item: MediaFile | MediaFolder) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  // Dosya önizleme
  const handlePreviewFile = (file: MediaFile) => {
    setEditingItem(file);
    setIsPreviewModalOpen(true);
  };

     // Debug: Dosya taşıma test fonksiyonu
   const debugFileMove = () => {
     console.log('=== DEBUG: Dosya Taşıma Testi ===');
     console.log('Mevcut Dosyalar:', files);
     console.log('Mevcut Klasörler:', folders);
     console.log('Güncellenmiş Klasör İstatistikleri:', foldersWithStats);
     console.log('Mevcut Klasör ID:', currentFolderId);
     
     const anaKlasorDosyalari = files.filter(f => !f.folderId);
     const klasorDosyalari = foldersWithStats.map(folder => ({
       klasor: folder.name,
       dosyaSayisi: folder.fileCount,
       toplamBoyut: folder.totalSize,
       dosyalar: files.filter(f => f.folderId === folder.id)
     }));
     
     console.log('Ana Klasör Dosyaları:', anaKlasorDosyalari);
     console.log('Klasör Dosyaları:', klasorDosyalari);
   };

  // Filtrelenmiş dosyalar
  const filteredFiles = files.filter(file => {
    const matchesFolder = !currentFolderId || file.folderId === currentFolderId;
    const matchesSearch = !searchTerm || 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  // Klasör istatistiklerini dinamik olarak hesapla
  const foldersWithStats = folders.map(folder => {
    const folderFiles = files.filter(file => file.folderId === folder.id);
    return {
      ...folder,
      fileCount: folderFiles.length,
      totalSize: folderFiles.reduce((total, file) => total + file.size, 0)
    };
  });

  // Mevcut klasör bilgisi (güncellenmiş istatistiklerle)
  const currentFolder = foldersWithStats.find(f => f.id === currentFolderId);



  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📁 Medya Yönetimi</h1>
              <p className="text-sm text-gray-500">Şirket dosyalarınızı organize edin</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFolderModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Yeni Klasör
              </button>
              <button
                onClick={() => setIsFileUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <FilePlus className="h-4 w-4 mr-2" />
                Dosya Yükle
              </button>
              <button
                onClick={debugFileMove}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                title="Dosya taşıma debug bilgileri için"
              >
                🐛 Debug
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Sidebar - Klasörler */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Klasörler</h3>
              
              {/* Ana Klasör */}
              <button
                onClick={() => setCurrentFolderId('')}
                className={`w-full text-left p-3 rounded-lg transition-colors mb-3 ${
                  !currentFolderId 
                    ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Folder className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Tüm Dosyalar</p>
                    <p className="text-sm text-gray-500">
                      {files.length} dosya • 
                      {(files.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </button>

                             {/* Klasör Listesi */}
               <div className="space-y-2">
                 {foldersWithStats.map((folder, index) => (
                   <DraggableFolder
                     key={folder.id}
                     folder={folder}
                     index={index}
                     onMove={handleMoveFolder}
                     onSelect={setCurrentFolderId}
                     onEdit={handleEdit}
                     onDelete={handleDeleteFolder}
                     onDropFile={handleMoveFile}
                     isSelected={currentFolderId === folder.id}
                   />
                 ))}
               </div>
            </div>
          </div>

          {/* Ana İçerik */}
          <div className="flex-1">
            {/* Üst Bar */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                                     <h2 className="text-lg font-medium text-gray-900">
                     {currentFolder ? currentFolder.name : 'Tüm Dosyalar'}
                   </h2>
                   <span className="text-sm text-gray-500">
                     {currentFolder 
                       ? `${currentFolder.fileCount} dosya • ${(currentFolder.totalSize / 1024 / 1024).toFixed(2)} MB`
                       : `${files.length} dosya • ${(files.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} MB`
                     }
                   </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Arama */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Dosya ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Görünüm Modu */}
                  <div className="flex border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                        viewMode === 'list'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dosya Listesi */}
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Dosya bulunamadı' : 'Henüz dosya yok'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                    : 'İlk dosyanızı yükleyerek başlayın'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setIsFileUploadModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FilePlus className="h-4 w-4 mr-2" />
                    Dosya Yükle
                  </button>
                )}
              </div>
            ) : (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                                                   {filteredFiles.map((file) => (
                    <DraggableFile
                      key={file.id}
                      file={file}
                      onMove={handleMoveFile}
                      onEdit={handleEdit}
                      onDelete={handleDeleteFile}
                      onDownload={handleDownloadFile}
                      onPreview={handlePreviewFile}
                      folders={foldersWithStats}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Klasör Oluşturma Modal */}
      <Modal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        title="Yeni Klasör Oluştur"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Klasör Adı *
            </label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Klasör adını girin..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={newFolderDescription}
              onChange={(e) => setNewFolderDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Klasör açıklaması..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Renk
            </label>
            <select
              value={newFolderColor}
              onChange={(e) => setNewFolderColor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="bg-blue-100">Mavi</option>
              <option value="bg-green-100">Yeşil</option>
              <option value="bg-purple-100">Mor</option>
              <option value="bg-yellow-100">Sarı</option>
              <option value="bg-red-100">Kırmızı</option>
            </select>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                newFolderName.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Klasör Oluştur
            </button>
            <button
              onClick={() => setIsFolderModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
          </div>
        </div>
      </Modal>

      {/* Dosya Yükleme Modal */}
      <Modal
        isOpen={isFileUploadModalOpen}
        onClose={() => setIsFileUploadModalOpen(false)}
        title="Dosya Yükle"
        size="lg"
      >
                 <FileUpload
           onFileUpload={handleFileUpload}
           folders={foldersWithStats}
           currentFolderId={currentFolderId}
         />
      </Modal>

             {/* Düzenleme Modal */}
       <Modal
         isOpen={isEditModalOpen}
         onClose={() => setIsEditModalOpen(false)}
         title="Düzenle"
         size="md"
       >
         {editingItem && (
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Ad
               </label>
               <input
                 type="text"
                 defaultValue={editingItem.name}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               />
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Açıklama
               </label>
               <textarea
                 defaultValue={editingItem.description || ''}
                 rows={3}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
               />
             </div>
             
             <div className="flex space-x-3 pt-4">
               <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                 Kaydet
               </button>
               <button
                 onClick={() => setIsEditModalOpen(false)}
                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
               >
                 İptal
               </button>
             </div>
           </div>
         )}
       </Modal>

       {/* Önizleme Modal */}
       <Modal
         isOpen={isPreviewModalOpen}
         onClose={() => setIsPreviewModalOpen(false)}
         title="Dosya Önizleme"
         size="lg"
       >
         {editingItem && 'type' in editingItem && (
           <FilePreview file={editingItem} />
         )}
       </Modal>
     </div>
     </DndProvider>
   );
 };
 
 export default MediaManagementPage;
