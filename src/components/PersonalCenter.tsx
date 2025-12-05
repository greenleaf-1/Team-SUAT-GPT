import { useState, useEffect } from 'react';
import {
  User,
  BookOpen,
  CheckSquare,
  Award,
  AlertOctagon,
  Clock,
  Download,
  Heart,
  Bell,
  Lock,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { getUserProfile } from '../utils/api-new';

type UserProfile = {
  name: string;
  studentId: string;
  college: string;
  major: string;
  avatar?: string;
  stats?: {
    currentCourses: number;
    completedCourses: number;
    homeworkCompletionRate: number;
    completedHomework: number;
    inProgressHomework: number;
    overdueHomework: number;
    weeklyStudyHours: number;
    readingHours: number;
    practiceCount: number;
    studyStreak: number;
  };
};

export function PersonalCenter() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">加载个人信息中...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">无法加载个人信息</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-4xl mx-auto space-y-4">
          {/* User Profile */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar || "https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=150"} />
                  <AvatarFallback>{profile.name}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="mb-1">{profile.name}</h2>
                  <div className="space-y-1 text-gray-600">
                    <p>学号：{profile.studentId}</p>
                    <p>{profile.college} · {profile.major}</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* My Courses */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="text-purple-900" />
                <CardTitle>我的课程</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">当前学期</span>
                  <span>{profile.stats?.currentCourses || 0}门课程</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">已完成</span>
                  <span>{profile.stats?.completedCourses || 0}门课程</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Homework Completion Rate */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckSquare className="text-purple-900" />
                <CardTitle>我的作业完成率</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">本学期整体完成率</span>
                    <span className="text-purple-900">{profile.stats?.homeworkCompletionRate || 0}%</span>
                  </div>
                  <Progress value={profile.stats?.homeworkCompletionRate || 0} />
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">已完成</span>
                    <span className="text-green-600">{profile.stats?.completedHomework || 0}项</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">进行中</span>
                    <span className="text-orange-600">{profile.stats?.inProgressHomework || 0}项</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">已逾期</span>
                    <span className="text-red-600">{profile.stats?.overdueHomework || 0}项</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exam Scores */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="text-purple-900" />
                <CardTitle>我的考试成绩概览</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p>高等数学</p>
                    <p className="text-sm text-gray-600">期中考试</p>
                  </div>
                  <Badge className="bg-green-600">88分</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p>线性代数</p>
                    <p className="text-sm text-gray-600">期中考试</p>
                  </div>
                  <Badge className="bg-green-600">92分</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p>数据结构</p>
                    <p className="text-sm text-gray-600">第一次测验</p>
                  </div>
                  <Badge className="bg-blue-600">85分</Badge>
                </div>
                <button className="w-full text-purple-900 hover:underline text-center py-2">
                  查看全部成绩
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Wrong Answer Book */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertOctagon className="text-purple-900" />
                <CardTitle>我的错题本（全局）</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-red-600 mb-1">15</p>
                    <p className="text-sm text-gray-600">错题总数</p>
                  </div>
                  <div>
                    <p className="text-green-600 mb-1">8</p>
                    <p className="text-sm text-gray-600">已掌握</p>
                  </div>
                  <div>
                    <p className="text-orange-600 mb-1">7</p>
                    <p className="text-sm text-gray-600">待复习</p>
                  </div>
                </div>
                <button className="w-full text-purple-900 hover:underline text-center py-2 border-t">
                  查看全部错题
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Learning Statistics */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="text-purple-900" />
                <CardTitle>学习行为统计</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-purple-900 mb-1">{profile.stats?.weeklyStudyHours || 0}小时</p>
                    <p className="text-sm text-gray-600">本周学习时长</p>
                  </div>
                  <div>
                    <p className="text-purple-900 mb-1">{profile.stats?.readingHours || 0}小时</p>
                    <p className="text-sm text-gray-600">阅读时间</p>
                  </div>
                  <div>
                    <p className="text-purple-900 mb-1">{profile.stats?.practiceCount || 0}题</p>
                    <p className="text-sm text-gray-600">刷题数量</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">最常学习时段</p>
                  <p>晚上 20:00 - 22:00</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">学习连续天数</p>
                  <p>{profile.stats?.studyStreak || 0}天 🔥</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other Settings */}
          <Card>
            <CardHeader>
              <CardTitle>其他设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Download className="text-gray-600" />
                    <span>下载管理</span>
                  </div>
                  <ChevronRight className="text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Heart className="text-gray-600" />
                    <span>我的收藏</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">23</Badge>
                    <ChevronRight className="text-gray-400" />
                  </div>
                </button>

                <Separator />

                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Bell className="text-gray-600" />
                    <span>通知推送</span>
                  </div>
                  <Switch defaultChecked />
                </div>

                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Lock className="text-gray-600" />
                    <span>隐私设置</span>
                  </div>
                  <ChevronRight className="text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Smartphone className="text-gray-600" />
                    <span>设备管理</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">2台设备</Badge>
                    <ChevronRight className="text-gray-400" />
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
