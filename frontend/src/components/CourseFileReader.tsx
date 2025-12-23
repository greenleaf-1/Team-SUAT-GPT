import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Eye, FileText, Loader } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getCourseFiles } from '../utils/api-new';

type CourseFileType = {
  id: string;
  fileName: string;
  fileType: string;
  description: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
};

type CourseFileReaderProps = {
  courseId: string;
  onBack: () => void;
};

/**
 * 课程课件查看组件
 * 用于显示课程的所有教学资料（课件、讲义等）
 */
export function CourseFileReader({ courseId, onBack }: CourseFileReaderProps) {
  const [files, setFiles] = useState<CourseFileType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true);
        const data = await getCourseFiles(courseId);
        setFiles(data as CourseFileType[]);
        setError(null);
      } catch (err) {
        console.error('Failed to load course files:', err);
        setError('加载课件失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [courseId]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('zh-CN');
    } catch {
      return dateString;
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'pptx':
      case 'ppt':
        return '📊';
      case 'docx':
      case 'doc':
        return '📝';
      case 'xlsx':
      case 'xls':
        return '📈';
      default:
        return '📎';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div>
            <h1>授课课件</h1>
            <p className="text-gray-600">查看和下载课程的教学资料</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-4xl mx-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin mr-2" size={20} />
              <span className="text-gray-600">加载课件中...</span>
            </div>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50 mb-4">
              <CardContent className="pt-6">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && files.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center py-8 text-center">
                  <FileText size={48} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">暂无课件</p>
                  <p className="text-gray-400 text-sm">教师还未上传课程资料</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && files.length > 0 && (
            <div className="space-y-3">
              {files.map((file) => (
                <Card
                  key={file.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer hover:bg-gray-50"
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">
                        {getFileIcon(file.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 break-words">
                          {file.fileName}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">{file.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>大小: {formatFileSize(file.fileSize)}</span>
                          <span>•</span>
                          <span>上传时间: {formatDate(file.uploadedAt)}</span>
                          <span>•</span>
                          <span className="font-medium text-gray-700">
                            {file.fileType.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            // 在新标签页中打开文件
                            window.open(file.filePath, '_blank');
                          }}
                          className="gap-2"
                        >
                          <Eye size={16} />
                          <span className="hidden sm:inline">查看</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            // 下载文件
                            const link = document.createElement('a');
                            link.href = file.filePath;
                            link.download = file.fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="gap-2"
                        >
                          <Download size={16} />
                          <span className="hidden sm:inline">下载</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
