import { useState } from 'react';
import { ArrowLeft, BookOpen, PenTool, MessageSquare, FileText, Bookmark, Search as SearchIcon, ListChecks, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TextbookReader } from './TextbookReader';
import { HomeworkSection } from './HomeworkSection';
import { CourseAI } from './CourseAI';

type Course = {
  id: string;
  name: string;
  code: string;
  teacher: string;
  time: string;
  semester: 'current' | 'history';
  progress: number;
  pendingTasks: number;
};

type CourseDetailProps = {
  course: Course;
  onBack: () => void;
};

type ViewMode = 'overview' | 'textbook' | 'homework' | 'ai';

export function CourseDetail({ course, onBack }: CourseDetailProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  if (viewMode === 'textbook') {
    return <TextbookReader course={course} onBack={() => setViewMode('overview')} />;
  }

  if (viewMode === 'homework') {
    return <HomeworkSection course={course} onBack={() => setViewMode('overview')} />;
  }

  if (viewMode === 'ai') {
    return <CourseAI course={course} onBack={() => setViewMode('overview')} />;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div>
            <h1>{course.name}</h1>
            <p className="text-gray-600">{course.code} - {course.teacher}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-4xl mx-auto space-y-4">
          {/* Main Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow bg-purple-50 border-purple-200"
              onClick={() => setViewMode('textbook')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-900 text-white rounded-lg">
                    <BookOpen size={24} />
                  </div>
                  <CardTitle>查看教材</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">阅读课程教材，做笔记和书签</p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow bg-blue-50 border-blue-200"
              onClick={() => setViewMode('homework')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 text-white rounded-lg">
                    <PenTool size={24} />
                  </div>
                  <CardTitle>做作业</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">完成练习题和上传作业</p>
                {course.pendingTasks > 0 && (
                  <p className="text-red-600 mt-2">{course.pendingTasks} 项待完成</p>
                )}
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow bg-green-50 border-green-200"
              onClick={() => setViewMode('ai')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-600 text-white rounded-lg">
                    <MessageSquare size={24} />
                  </div>
                  <CardTitle>AI提问</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">课程知识问答和智能辅导</p>
              </CardContent>
            </Card>
          </div>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>课程信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-600 mb-1">上课时间</p>
                <p>{course.time}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">学习进度</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-900 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <span className="text-purple-900">{course.progress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b">
                  <FileText className="text-purple-900 mt-1" size={20} />
                  <div className="flex-1">
                    <p>第五章练习题已发布</p>
                    <p className="text-gray-600">截止时间：11月15日 23:59</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b">
                  <Bookmark className="text-purple-900 mt-1" size={20} />
                  <div className="flex-1">
                    <p>您在第四章第2节添加了书签</p>
                    <p className="text-gray-600">2天前</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ListChecks className="text-purple-900 mt-1" size={20} />
                  <div className="flex-1">
                    <p>第四章测验已完成</p>
                    <p className="text-gray-600">得分：85/100</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
