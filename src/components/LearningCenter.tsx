import { useState, useEffect } from 'react';
import { Search, BookOpen, Clock, ChevronRight, FileText, PenTool } from 'lucide-react';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CourseDetail } from './CourseDetail';
import { getCourses } from '../utils/api-new';

type Course = {
  id: string;
  name: string;
  code?: string;
  teacher: string;
  time?: string;
  semester?: 'current' | 'history';
  progress: number;
  pendingTasks?: number;
  totalChapters?: number;
  completedChapters?: number;
};

export function LearningCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();
        // 添加额外字段以匹配原来的Course类型
        const enrichedCourses = data.map((course: any) => ({
          ...course,
          code: course.code || `COURSE${course.id.toUpperCase()}`,
          time: course.time || '周一、周三 8:00-9:40',
          semester: 'current' as const,
          pendingTasks: Math.floor(Math.random() * 3), // 临时随机数据
        }));
        setCourses(enrichedCourses);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    );
  }

  const filteredCourses = (semester: 'current' | 'history') =>
    courses.filter(
      (course) =>
        course.semester === semester &&
        (course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.code && course.code.toLowerCase().includes(searchQuery.toLowerCase())))
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">加载课程中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-4xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索课程名称或课程代码"
                className="pl-10"
              />
            </div>
          </div>

          {/* Course Tabs */}
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="current" className="flex-1">
                当前学期课程
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                历史课程
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <div className="space-y-4">
                {filteredCourses('current').map((course) => (
                  <Card
                    key={course.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="mb-2">{course.name}</CardTitle>
                          <p className="text-gray-600">{course.code}</p>
                        </div>
                        <ChevronRight className="text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <BookOpen size={16} />
                          <span>教师：{course.teacher}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={16} />
                          <span>{course.time}</span>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">学习进度</span>
                            <span className="text-purple-900">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-900 h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                        {course.pendingTasks > 0 && (
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">{course.pendingTasks} 项待完成任务</Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {filteredCourses('history').map((course) => (
                  <Card
                    key={course.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow opacity-75"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="mb-2">{course.name}</CardTitle>
                          <p className="text-gray-600">{course.code}</p>
                        </div>
                        <ChevronRight className="text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <BookOpen size={16} />
                          <span>教师：{course.teacher}</span>
                        </div>
                        <Badge variant="secondary">已完成</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
