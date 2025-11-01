# 音乐之禅项目 - 技术栈与工作流程

## 1. 技术栈概述

### 1.1 前端框架与工具
- **Vue.js 3**：渐进式JavaScript框架，用于构建用户界面
- **Vite**：下一代前端构建工具，提供极速的开发体验和优化的构建输出
- **Tailwind CSS**：实用优先的CSS框架，提供快速构建现代界面的能力
- **Font Awesome**：丰富的图标库，用于界面元素的图标展示

### 1.2 开发环境配置
- **Node.js**：JavaScript运行时环境，版本管理使用nvm
- **npm**：Node.js包管理器，用于依赖管理
- **ESLint**：JavaScript代码检查工具，保证代码质量
- **Prettier**：代码格式化工具，统一代码风格

### 1.3 构建与部署
- **GitHub Actions**：自动化CI/CD工作流
- **GitHub Pages**：静态网站托管服务

## 2. 项目结构

```
/Users/tim/Repositories/games/taom/
├── .editorconfig        # 编辑器配置
├── .github/             # GitHub配置目录
│   └── workflows/       # GitHub Actions工作流
│       └── static.yml   # 静态站点部署配置
├── .gitignore           # Git忽略文件配置
├── .prettierignore      # Prettier忽略文件配置
├── .prettierrc          # Prettier配置
├── README.md            # 项目说明文档
├── index.html           # HTML入口文件
├── package-lock.json    # 依赖版本锁定文件
├── package.json         # 项目配置和依赖管理
├── postcss.config.js    # PostCSS配置
├── src/                 # 源代码目录
│   ├── App.vue          # 根组件
│   ├── css/             # CSS样式目录
│   │   └── main.css     # 主样式文件
│   ├── main.js          # JavaScript入口文件
│   └── taom.svg         # 项目图标
├── tailwind.config.js   # Tailwind CSS配置
├── vite.config.js       # Vite配置
└── docs/                # 项目文档目录
    ├── prd.md           # 产品需求文档
    ├── answers_summary.md # 回答总结记录
    └── tech_stack_workflow.md # 技术栈与工作流程
```

## 3. 开发工作流程

### 3.1 项目初始化与设置

1. **克隆仓库**：从GitHub克隆项目代码
2. **安装依赖**：运行 `npm install` 安装项目依赖
3. **开发环境配置**：确保Node.js版本符合要求（项目使用Node.js v22）

### 3.2 日常开发流程

1. **启动开发服务器**：运行 `npm run start` 启动Vite开发服务器
2. **代码编写**：遵循项目的代码规范进行开发
3. **代码格式化**：使用Prettier保持代码风格一致
4. **本地测试**：在浏览器中测试功能实现和界面效果
5. **构建验证**：运行 `npm run build` 验证构建是否成功

### 3.3 版本控制与协作

1. **代码提交**：使用Git进行版本控制，遵循合理的提交信息规范
2. **分支管理**：使用功能分支进行开发，完成后合并到主分支
3. **Pull Request**：提交代码审查，确保代码质量

### 3.4 构建与部署流程

1. **自动构建**：推送到master分支后，GitHub Actions自动触发构建
2. **部署流程**：
   - 检出代码（actions/checkout@v4）
   - 配置Node.js环境（actions/setup-node@v4）
   - 安装依赖（npm ci）
   - 构建项目（npm run build）
   - 配置GitHub Pages（actions/configure-pages@v5）
   - 上传构建产物（actions/upload-pages-artifact@v3）
   - 部署到GitHub Pages（actions/deploy-pages@v4）
3. **部署验证**：部署完成后，通过GitHub Pages URL验证部署效果

## 4. AI辅助开发流程

### 4.1 需求分析与规划
- 使用AI工具辅助理解产品需求
- 根据需求生成初步的技术方案
- 规划开发任务和优先级

### 4.2 代码实现与优化
- 使用AI辅助生成代码片段
- 基于项目现有代码风格进行调整
- 实现新功能并优化现有功能

### 4.3 问题诊断与修复
- 使用AI工具分析错误日志和异常情况
- 提供可能的解决方案和修复建议
- 验证修复效果并确保稳定性

### 4.4 文档编写与维护
- 使用AI辅助编写技术文档和注释
- 记录开发过程中的重要决策和解决方案
- 维护项目文档的完整性和准确性

## 5. 最佳实践与规范

### 5.1 代码规范
- 使用ES6+语法特性
- 遵循Vue.js 3的最佳实践
- 组件命名、变量命名遵循一致的规范
- 代码注释清晰简洁，解释复杂逻辑

### 5.2 性能优化
- 合理使用Vue的响应式系统
- 避免不必要的重渲染
- 优化资源加载和缓存策略
- 确保移动端良好的性能体验

### 5.3 可访问性
- 确保颜色对比度符合可访问性标准
- 提供合适的ARIA属性
- 支持键盘导航

### 5.4 安全性
- 避免XSS攻击
- 安全处理用户上传的文件
- 遵循浏览器安全策略

## 6. 常见问题与解决方案

### 6.1 构建问题
- **问题**：构建失败或资源路径错误
- **解决方案**：检查vite.config.js配置，确保base路径设置正确

### 6.2 浏览器兼容性问题
- **问题**：在特定浏览器中功能异常
- **解决方案**：使用浏览器兼容工具，添加必要的polyfill

### 6.3 自动播放限制
- **问题**：浏览器自动播放策略阻止音频播放
- **解决方案**：利用用户交互事件，实现多级播放策略，包括静音播放备选方案

### 6.4 GitHub Actions部署问题
- **问题**：部署工作流执行失败
- **解决方案**：检查工作流配置，确保启用GitHub Pages，构建路径正确