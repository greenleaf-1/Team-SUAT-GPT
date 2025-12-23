import { useState } from 'react';
import { Activity, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DiagnosticResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

export function NetworkDiagnostics() {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: DiagnosticResult[] = [];

    // 测试1: 基本网络连接
    diagnostics.push({
      test: '基本网络连接',
      status: 'pending',
      message: '检查中...'
    });
    setResults([...diagnostics]);

    try {
      await fetch('https://www.baidu.com', { mode: 'no-cors' });
      diagnostics[0] = {
        test: '基本网络连接',
        status: 'success',
        message: '✅ 网络连接正常'
      };
    } catch {
      diagnostics[0] = {
        test: '基本网络连接',
        status: 'error',
        message: '❌ 无法连接互联网'
      };
    }
    setResults([...diagnostics]);

    // 测试2: AI服务连通性 (Qwen)
    diagnostics.push({
      test: 'Qwen AI服务',
      status: 'pending',
      message: '检查中...'
    });
    setResults([...diagnostics]);

    try {
      const response = await fetch('http://10.22.18.12:40011/v1/models', {
        headers: {
          'Authorization': 'Bearer 2c1730a6-6a03-4e36-a885-39593ff99e37'
        }
      });
      
      if (response.ok) {
        diagnostics[1] = {
          test: 'Qwen AI服务',
          status: 'success',
          message: '✅ AI服务连接成功',
          details: `状态码: ${response.status}`
        };
      } else {
        diagnostics[1] = {
          test: 'Qwen AI服务',
          status: 'error',
          message: `⚠️ 服务响应异常`,
          details: `状态码: ${response.status}`
        };
      }
    } catch (error: any) {
      diagnostics[1] = {
        test: 'Qwen AI服务',
        status: 'error',
        message: '❌ 无法连接AI服务',
        details: `错误: ${error.message}\n\n可能原因：
- 不在校园网环境
- 防火墙阻止了内网访问
- CORS跨域限制
- AI服务未启动`
      };
    }
    setResults([...diagnostics]);

    // 测试3: AI服务测试
    diagnostics.push({
      test: 'AI对话测试',
      status: 'pending',
      message: '检查中...'
    });
    setResults([...diagnostics]);

    try {
      const { sendAIChatMessage } = await import('../utils/api-new');
      const response = await sendAIChatMessage({
        message: '请回复"测试成功"',
        model: 'qwenPublic',
        conversationHistory: []
      });
      
      diagnostics[2] = {
        test: 'AI对话测试 (通过后端)',
        status: 'success',
        message: '✅ AI对话功能正常',
        details: `AI回复: ${response.response.substring(0, 100)}`
      };
    } catch (error: any) {
      diagnostics[2] = {
        test: 'AI对话测试 (通过后端)',
        status: 'error',
        message: '❌ AI对话失败',
        details: error.message
      };
    }
    setResults([...diagnostics]);

    setIsRunning(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-52 right-4 z-40 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
        title="网络诊断"
      >
        <Activity className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-600" />
              <CardTitle>网络与AI服务诊断</CardTitle>
            </div>
            <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
              关闭
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              此工具将帮助您诊断AI服务连接问题。点击下方按钮开始测试。
            </p>
          </div>

          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                诊断中...
              </>
            ) : (
              '开始诊断'
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">诊断结果：</h3>
              {results.map((result, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {result.status === 'pending' && (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      )}
                      {result.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {result.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{result.test}</h4>
                      <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                      {result.details && (
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto whitespace-pre-wrap">
                          {result.details}
                        </pre>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">💡 解决建议</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>确保连接到校园网</li>
              <li>在浏览器中直接访问 <code className="bg-gray-200 px-1 rounded">http://10.22.18.12:40011/v1/models</code></li>
              <li>按F12打开浏览器控制台查看详细错误</li>
              <li>检查防火墙设置是否阻止了内网访问</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}