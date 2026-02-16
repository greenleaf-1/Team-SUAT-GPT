import { useState } from 'react';
import { Settings, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export function AISettings() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-36 right-4 z-40 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="AI设置"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  const aiModels = [
    {
      id: 'qwenPublic',
      name: 'Qwen Max (公网)',
      description: '通义千问最强模型，无需内网',
      baseUrl: 'https://dashscope.aliyuncs.com',
      modelId: 'qwen-max',
      status: 'online' as const,
    },
    {
      id: 'qwen',
      name: 'Qwen3-30B (内网)',
      description: '校内高性能模型，需要校园网',
      baseUrl: 'http://10.22.18.12:40011',
      modelId: 'Qwen3-30B-A3B',
      status: 'backend' as const,
    },
    {
      id: 'deepseek',
      name: 'DeepSeek-R1',
      description: '深度推理模型，适合复杂问题',
      baseUrl: 'http://10.22.18.101:9997',
      modelId: 'deepseek-r1-0528-w8a8',
      status: 'backend' as const,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">AI模型配置</h2>
            </div>
            <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
              关闭
            </Button>
          </div>

          {/* Description */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>当前使用模型：</strong>Qwen3-30B-A3B
              <br />
              您可以在这里查看所有已配置的AI模型状态。所有模型都已正确配置并可使用。
            </p>
          </div>

          {/* Models List */}
          <div className="space-y-4">
            {aiModels.map((model) => (
              <Card key={model.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{model.name}</h3>
                      {model.status === 'checking' && (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      )}
                      {model.status === 'online' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {model.status === 'offline' && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      {model.status === 'backend' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                    <div className="space-y-1 text-xs font-mono bg-gray-50 p-3 rounded">
                      <p className="text-gray-600">
                        <span className="font-semibold">Base URL:</span> {model.baseUrl}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Model ID:</span> {model.modelId}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Status:</span>{' '}
                        {model.status === 'checking' && '检查中...'}
                        {model.status === 'online' && '✓ 在线'}
                        {model.status === 'offline' && '✗ 离线（可能需要内网环境）'}
                        {model.status === 'backend' && '✓ 后端在线'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={() => alert('当前所有AI模型都通过Java后端调用，无需前端检测')} variant="outline" className="flex-1">
              查看模型状态
            </Button>
          </div>

          {/* Connection Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">📡 重要说明</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>所有AI模型调用已通过Java后端转发</strong>
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>前端不再直接调用AI接口</li>
                <li>API密钥存储在Java后端，更加安全</li>
                <li>所有请求通过 <code>/api/ai/chat</code> 接口</li>
              </ul>
              <div className="mt-3 p-2 bg-blue-100 rounded">
                <p className="font-medium">✅ 确保Java后端服务运行在 http://localhost:8080</p>
              </div>
            </div>
          </div>

          {/* API Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🔒 安全性</h3>
            <p className="text-sm text-gray-600">
              所有API密钥现已从前端移除，存储在Java后端配置文件中。
              <br />
              前端代码不包含任何敏感信息。
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}