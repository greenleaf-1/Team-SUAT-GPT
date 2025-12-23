import { useState } from 'react';
import { ArrowLeft, BookmarkPlus, Bookmark, StickyNote, Search, List } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

type Course = {
  id: string;
  name: string;
  code: string;
};

type TextbookReaderProps = {
  course: Course;
  onBack: () => void;
};

type Chapter = {
  id: string;
  title: string;
  sections: string[];
};

const CHAPTERS: Chapter[] = [
  {
    id: '1',
    title: '第一章 函数与极限',
    sections: ['1.1 函数的概念', '1.2 极限的定义', '1.3 极限的性质', '1.4 无穷小与无穷大'],
  },
  {
    id: '2',
    title: '第二章 导数与微分',
    sections: ['2.1 导数的定义', '2.2 求导法则', '2.3 高阶导数', '2.4 微分的概念'],
  },
  {
    id: '3',
    title: '第三章 中值定理',
    sections: ['3.1 罗尔定理', '3.2 拉格朗日中值定理', '3.3 柯西中值定理'],
  },
  {
    id: '4',
    title: '第四章 不定积分',
    sections: ['4.1 原函数与不定积分', '4.2 换元积分法', '4.3 分部积分法'],
  },
  {
    id: '5',
    title: '第五章 定积分',
    sections: ['5.1 定积分的概念', '5.2 微积分基本定理', '5.3 定积分的应用'],
  },
];

export function TextbookReader({ course, onBack }: TextbookReaderProps) {
  const [currentChapter, setCurrentChapter] = useState(CHAPTERS[0]);
  const [currentSection, setCurrentSection] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [showChapters, setShowChapters] = useState(false);

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? '已移除书签' : '已添加书签');
  };

  const handleSaveNote = () => {
    toast.success('笔记已保存');
    setShowNotes(false);
    setNoteContent('');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft />
            </Button>
            <div>
              <h2>{course.name} - 教材</h2>
              <p className="text-gray-600">
                {currentChapter.title} - {currentChapter.sections[currentSection]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowChapters(!showChapters)}>
              <List />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowNotes(!showNotes)}>
              <StickyNote />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              className={bookmarked ? 'text-purple-900' : ''}
            >
              {bookmarked ? <Bookmark className="fill-current" /> : <BookmarkPlus />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chapter Navigation Sidebar */}
        {showChapters && (
          <div className="w-80 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="mb-4">目录</h3>
              <div className="space-y-2">
                {CHAPTERS.map((chapter) => (
                  <div key={chapter.id}>
                    <button
                      onClick={() => {
                        setCurrentChapter(chapter);
                        setCurrentSection(0);
                        setShowChapters(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        currentChapter.id === chapter.id
                          ? 'bg-purple-900 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {chapter.title}
                    </button>
                    {currentChapter.id === chapter.id && (
                      <div className="ml-4 mt-1 space-y-1">
                        {chapter.sections.map((section, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setCurrentSection(idx);
                              setShowChapters(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded text-sm ${
                              currentSection === idx
                                ? 'text-purple-900'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            {section}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-4xl mx-auto">
            <h1 className="mb-6">{currentChapter.sections[currentSection]}</h1>

            <div className="space-y-6">
              <section>
                <h2 className="mb-4">定义</h2>
                <p className="leading-relaxed text-gray-700">
                  在数学中，函数是一种关系，它将一个集合中的每个元素映射到另一个集合中的唯一元素。
                  函数通常用 f(x) 表示，其中 x 是自变量，f(x) 是因变量。
                </p>
              </section>

              <section>
                <h2 className="mb-4">性质</h2>
                <div className="space-y-3">
                  <p className="leading-relaxed text-gray-700">
                    1. <strong>单射性</strong>：不同的输入产生不同的输出
                  </p>
                  <p className="leading-relaxed text-gray-700">
                    2. <strong>满射性</strong>：值域等于陪域
                  </p>
                  <p className="leading-relaxed text-gray-700">
                    3. <strong>双射性</strong>：既是单射又是满射
                  </p>
                </div>
              </section>

              <section>
                <h2 className="mb-4">例题</h2>
                <Card className="bg-blue-50">
                  <CardContent className="pt-6">
                    <p className="mb-4">
                      <strong>例1：</strong>求函数 f(x) = 2x + 3 在 x = 5 时的值。
                    </p>
                    <p className="text-gray-700">
                      <strong>解：</strong>将 x = 5 代入函数表达式：
                      <br />
                      f(5) = 2(5) + 3 = 10 + 3 = 13
                    </p>
                  </CardContent>
                </Card>
              </section>

              <section>
                <h2 className="mb-4">练习题</h2>
                <Card>
                  <CardContent className="pt-6">
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>求函数 f(x) = x² - 4x + 3 的零点</li>
                      <li>证明函数 f(x) = 3x + 1 是单射函数</li>
                      <li>求函数 f(x) = sin(x) 的周期</li>
                    </ol>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentSection > 0) {
                    setCurrentSection(currentSection - 1);
                  } else {
                    const currentIdx = CHAPTERS.findIndex((c) => c.id === currentChapter.id);
                    if (currentIdx > 0) {
                      setCurrentChapter(CHAPTERS[currentIdx - 1]);
                      setCurrentSection(CHAPTERS[currentIdx - 1].sections.length - 1);
                    }
                  }
                }}
                disabled={currentChapter.id === CHAPTERS[0].id && currentSection === 0}
              >
                上一节
              </Button>
              <Button
                onClick={() => {
                  if (currentSection < currentChapter.sections.length - 1) {
                    setCurrentSection(currentSection + 1);
                  } else {
                    const currentIdx = CHAPTERS.findIndex((c) => c.id === currentChapter.id);
                    if (currentIdx < CHAPTERS.length - 1) {
                      setCurrentChapter(CHAPTERS[currentIdx + 1]);
                      setCurrentSection(0);
                    }
                  }
                }}
                disabled={
                  currentChapter.id === CHAPTERS[CHAPTERS.length - 1].id &&
                  currentSection === currentChapter.sections.length - 1
                }
                className="bg-purple-900 hover:bg-purple-800"
              >
                下一节
              </Button>
            </div>
          </div>
        </div>

        {/* Notes Sidebar */}
        {showNotes && (
          <div className="w-80 border-l border-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3>笔记</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNotes(false)}>
                关闭
              </Button>
            </div>
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="在这里记录笔记..."
              className="min-h-[200px] mb-4"
            />
            <Button onClick={handleSaveNote} className="w-full bg-purple-900 hover:bg-purple-800">
              保存笔记
            </Button>

            <div className="mt-6">
              <h4 className="mb-3">已保存的笔记</h4>
              <div className="space-y-3">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-2">第三章 3.1节</p>
                    <p className="text-sm">罗尔定理的三个条件很重要，考试重点。</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 mb-2">第二章 2.2节</p>
                    <p className="text-sm">复合函数求导要用链式法则。</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
