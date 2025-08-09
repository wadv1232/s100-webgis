export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Tailwind CSS 测试页面</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-blue-600 mb-3">蓝色卡片</h2>
            <p className="text-gray-700">这是一个测试卡片，用来验证Tailwind CSS样式是否正常工作。</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              蓝色按钮
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-green-600 mb-3">绿色卡片</h2>
            <p className="text-gray-700">这是一个测试卡片，用来验证Tailwind CSS样式是否正常工作。</p>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
              绿色按钮
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-purple-600 mb-3">紫色卡片</h2>
            <p className="text-gray-700">这是一个测试卡片，用来验证Tailwind CSS样式是否正常工作。</p>
            <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
              紫色按钮
            </button>
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">样式测试结果</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>背景渐变: from-blue-50 to-indigo-100</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>卡片样式: bg-white, shadow-lg, rounded-lg</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span>按钮样式: hover, transition-colors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}