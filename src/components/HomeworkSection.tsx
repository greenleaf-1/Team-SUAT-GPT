import { useState } from 'react';
import { ArrowLeft, Upload, CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner@2.0.3';

type Course = {
  id: string;
  name: string;
  code: string;
};

type HomeworkSectionProps = {
  course: Course;
  onBack: () => void;
};

type Exercise = {
  id: string;
  chapter: string;
  question: string;
  completed: boolean;
};

type Assignment = {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
};

const EXERCISES: Exercise[] = [
  { id: '1', chapter: '第一章', question: '求极限 lim(x→0) sin(x)/x', completed: true },
  { id: '2', chapter: '第一章', question: '证明函数 f(x)=1/x 在 x=0 处不连续', completed: true },
  { id: '3', chapter: '第二章', question: '求函数 f(x)=x³-3x²+2 的导数', completed: false },
  { id: '4', chapter: '第二章', question: '用导数定义求 f(x)=√x 的导数', completed: false },
];

const ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    title: '第五章练习题',
    dueDate: '2025-11-15',
    status: 'pending',
  },
  {
    id: '2',
    title: '第四章测验',
    dueDate: '2025-11-10',
    status: 'graded',
    score: 85,
  },
  {
    id: '3',
    title: '期中作业',
    dueDate: '2025-11-08',
    status: 'submitted',
  },
];

const WRONG_ANSWERS = [
  {
    id: '1',
    question: '求函数 f(x)=x²+2x+1 在 x=1 处的导数值',
    yourAnswer: 'f\'(1) = 2',
    correctAnswer: 'f\'(1) = 4',
    explanation: '导数 f\'(x) = 2x + 2，代入 x=1 得 f\'(1) = 2(1) + 2 = 4',
  },
  {
    id: '2',
    question: '计算不定积分 ∫x²dx',
    yourAnswer: '∫x²dx = x³',
    correctAnswer: '∫x²dx = x³/3 + C',
    explanation: '幂函数积分公式：∫xⁿdx = xⁿ⁺¹/(n+1) + C，不要忘记常数C',
  },
];

export function HomeworkSection({ course, onBack }: HomeworkSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      toast.success('作业已提交');
      setSelectedFile(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft />
          </Button>
          <div>
            <h2>{course.name} - 作业中心</h2>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 max-w-4xl mx-auto">
          <Tabs defaultValue="exercises" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="exercises" className="flex-1">
                章节练习
              </TabsTrigger>
              <TabsTrigger value="assignments" className="flex-1">
                作业提交
              </TabsTrigger>
              <TabsTrigger value="wrong" className="flex-1">
                错题本
              </TabsTrigger>
              <TabsTrigger value="mock" className="flex-1">
                模拟考试
              </TabsTrigger>
            </TabsList>

            {/* Chapter Exercises */}
            <TabsContent value="exercises">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>学习进度</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Progress value={50} className="flex-1" />
                      <span className="text-gray-600">
                        {EXERCISES.filter((e) => e.completed).length}/{EXERCISES.length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {EXERCISES.map((exercise) => (
                  <Card key={exercise.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {exercise.completed ? (
                            <CheckCircle className="text-green-600" size={24} />
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{exercise.chapter}</Badge>
                          </div>
                          <p className="mb-2">{exercise.question}</p>
                          {!exercise.completed && (
                            <Button size="sm" className="bg-purple-900 hover:bg-purple-800">
                              开始练习
                            </Button>
                          )}
                          {exercise.completed && (
                            <Button size="sm" variant="outline">
                              查看解析
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Assignments */}
            <TabsContent value="assignments">
              <div className="space-y-4">
                {ASSIGNMENTS.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="mb-2">{assignment.title}</CardTitle>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock size={16} />
                            <span>截止时间：{assignment.dueDate}</span>
                          </div>
                        </div>
                        <Badge
                          variant={
                            assignment.status === 'graded'
                              ? 'default'
                              : assignment.status === 'submitted'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {assignment.status === 'pending' && '待提交'}
                          {assignment.status === 'submitted' && '已提交'}
                          {assignment.status === 'graded' && '已批改'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {assignment.status === 'pending' && (
                        <div className="space-y-3">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                            <p className="text-gray-600 mb-3">点击上传或拖拽文件到此处</p>
                            <input
                              type="file"
                              onChange={handleFileSelect}
                              className="hidden"
                              id={`file-${assignment.id}`}
                            />
                            <label htmlFor={`file-${assignment.id}`}>
                              <Button variant="outline" className="cursor-pointer" asChild>
                                <span>选择文件</span>
                              </Button>
                            </label>
                          </div>
                          {selectedFile && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span>{selectedFile.name}</span>
                              <Button onClick={handleUpload} className="bg-purple-900 hover:bg-purple-800">
                                提交作业
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                      {assignment.status === 'graded' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <span>得分</span>
                            <span className="text-green-600">{assignment.score}/100</span>
                          </div>
                          <Button variant="outline" className="w-full">
                            查看批改反馈
                          </Button>
                        </div>
                      )}
                      {assignment.status === 'submitted' && (
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <p className="text-blue-600">作业已提交，等待批改</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Wrong Answers Book */}
            <TabsContent value="wrong">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>错题统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-gray-600 mb-1">错题总数</p>
                        <p className="text-red-600">{WRONG_ANSWERS.length}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">已复习</p>
                        <p className="text-green-600">0</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">待复习</p>
                        <p className="text-orange-600">{WRONG_ANSWERS.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {WRONG_ANSWERS.map((item) => (
                  <Card key={item.id} className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-600">错题</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="mb-2">{item.question}</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">你的答案</p>
                        <p className="text-red-600">{item.yourAnswer}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">正确答案</p>
                        <p className="text-green-600">{item.correctAnswer}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">详细解析</p>
                        <p className="text-gray-700">{item.explanation}</p>
                      </div>
                      <Button className="w-full bg-purple-900 hover:bg-purple-800">
                        标记为已复习
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Mock Exam */}
            <TabsContent value="mock">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>模拟考试</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      模拟考试将根据课程内容生成试题，帮助你检验学习成果。
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>题目数量</span>
                        <span>20题</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>考试时长</span>
                        <span>60分钟</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>覆盖章节</span>
                        <span>第1-5章</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-purple-900 hover:bg-purple-800">
                      开始模拟考试
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>历史记录</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p>模拟考试 #3</p>
                          <p className="text-sm text-gray-600">2025-11-10</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-600">88分</p>
                          <Button variant="link" size="sm">
                            查看详情
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p>模拟考试 #2</p>
                          <p className="text-sm text-gray-600">2025-11-05</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-600">82分</p>
                          <Button variant="link" size="sm">
                            查看详情
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
