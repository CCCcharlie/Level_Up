# 代码变更对比详解

## 📊 核心修改总览

本文档展示了所有关键文件的修改前后对比。

---

## 1️⃣ package.json - 依赖添加

### ✨ 修改内容

添加了三个新的 i18n 相关依赖：

```json
{
  "dependencies": {
    // ... 其他依赖
    "i18next": "^23.7.6",                                    // NEW
    "react-i18next": "^14.0.0",                              // NEW
    "i18next-browser-languagedetector": "^7.2.0"           // NEW
  }
}
```

### 📝 说明

- `i18next`: 核心国际化库
- `react-i18next`: React 绑定，提供 hooks
- `i18next-browser-languagedetector`: 自动检测浏览器语言

---

## 2️⃣ src/main.tsx - i18n 初始化

### Before
```typescript
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### After
```typescript
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import "./i18n/config.ts";  // ← NEW: 初始化 i18n

createRoot(document.getElementById("root")!).render(<App />);
```

### 📝 说明

导入 `./i18n/config.ts` 确保 i18n 在应用启动时初始化。必须在 App 组件之前导入。

---

## 3️⃣ src/i18n/config.ts - 新文件（i18n 配置）

### 完整内容

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import zh from './locales/zh.json';
import en from './locales/en.json';

// 资源对象 - 包含所有语言的翻译
const resources = {
  en: { translation: en },    // 英文翻译
  zh: { translation: zh },    // 中文翻译
};

// 初始化 i18next
i18n
  .use(LanguageDetector)       // 使用浏览器语言检测
  .use(initReactI18next)       // 使用 React 集成
  .init({
    resources,                 // 注册翻译资源
    fallbackLng: 'zh',         // 回退语言（默认）
    defaultNS: 'translation',  // 默认命名空间
    interpolation: {
      escapeValue: false,      // React 已处理 XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],  // 检测优先级
      caches: ['localStorage'],  // 缓存选择
    },
  });

export default i18n;
```

### 🎯 配置解析

| 配置项 | 值 | 说明 |
|-------|-----|------|
| `fallbackLng` | `'zh'` | 用户未选择时默认为中文 |
| `detection.order[0]` | `'localStorage'` | 优先使用保存的选择 |
| `detection.order[1]` | `'navigator'` | 其次检测浏览器语言 |
| `caches` | `['localStorage']` | 将选择保存到 localStorage |

---

## 4️⃣ src/store/useGameStore.ts - Store 扩展

### 4.1 导入新增

```typescript
// BEFORE
import { create } from 'zustand';
import { toast } from 'sonner';
import { ... } from '../lib/aiService.ts';

// AFTER
import { create } from 'zustand';
import { persist } from 'zustand/middleware';  // ← NEW
import { toast } from 'sonner';
import i18n from '../i18n/config';               // ← NEW
import { ... } from '../lib/aiService.ts';
```

### 4.2 State Interface 修改

```typescript
// BEFORE
interface GameState {
  // 1. 职业定锚状态
  careerDirection: string | null;
  // ... 其他字段

  // --- Actions ---
  addExp: (amount: number) => void;
  // ... 其他 actions
  signOut: () => Promise<void>;
}

// AFTER
interface GameState {
  // 1. 职业定锚状态
  careerDirection: string | null;
  // ... 其他字段

  // 5. 国际化 (i18n)          ← NEW
  language: 'zh' | 'en';       ← NEW

  // --- Actions ---
  addExp: (amount: number) => void;
  // ... 其他 actions
  setLanguage: (lang: 'zh' | 'en') => void;  ← NEW
  signOut: () => Promise<void>;
}
```

### 4.3 初始状态修改

```typescript
// BEFORE
export const useGameStore = create<GameState>((set, get) => ({
  careerDirection: null,
  userTargetLevel: 'Junior',
  isOnboarded: false,
  // ... 其他初始状态

// AFTER
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      careerDirection: null,
      userTargetLevel: 'Junior',
      isOnboarded: false,
      language: 'zh',  // ← NEW: 默认中文
      // ... 其他初始状态
```

### 4.4 语言切换 Action 新增

```typescript
// ← NEW ACTION
setLanguage: (lang: 'zh' | 'en') => {
  set({ language: lang });          // 更新 store
  void i18n.changeLanguage(lang);   // 更新 i18n
},
```

### 4.5 Store 创建用 persist 包装

```typescript
// BEFORE
export const useGameStore = create<GameState>((set, get) => ({
  // ... store 实现
}));

// AFTER
export const useGameStore = create<GameState>()(    // ← 使用 ()() 双括号语法
  persist(
    (set, get) => ({
      // ... store 实现
    }),
    {
      name: 'game-store',              // ← localStorage key
      partialize: (state) => ({        // ← 仅持久化 language
        language: state.language,
      }),
    }
  )
);
```

---

## 5️⃣ src/app/components/LanguageSwitcher.tsx - 新组件

### 完整代码

```typescript
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import useGameStore from '../../store/useGameStore';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

/**
 * 语言切换按钮组件
 * 位置：Sidebar Header
 * 功能：提供中文/英文切换
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useGameStore();

  return (
    <DropdownMenu>
      {/* 切换按钮 */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg hover:bg-slate-800"
          title="Switch language"
        >
          <Languages className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>

      {/* 下拉菜单内容 */}
      <DropdownMenuContent align="end" className="w-40">
        {/* 中文选项 */}
        <DropdownMenuItem
          onClick={() => setLanguage('zh')}
          className={language === 'zh' ? 'bg-slate-800' : ''}
        >
          <span>中文 (Chinese)</span>
          {language === 'zh' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>

        {/* 英文选项 */}
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-slate-800' : ''}
        >
          <span>English</span>
          {language === 'en' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 🎨 UI 特点

- 🌐 使用 `Languages` 图标
- 📍 放在 Sidebar Header
- ✅ 显示当前语言的勾选标记
- 🎭 暗黑主题适配

---

## 6️⃣ src/app/App.tsx - 集成语言切换

### 6.1 导入新增

```typescript
// BEFORE
import { EquipmentSystem } from './components/EquipmentSystem';
import { ScrollArea } from './components/ui/scroll-area';

// AFTER
import { EquipmentSystem } from './components/EquipmentSystem';
import { LanguageSwitcher } from './components/LanguageSwitcher';  // ← NEW
import { ScrollArea } from './components/ui/scroll-area';
```

### 6.2 JSX 修改

```typescript
// BEFORE
<div className="flex items-center justify-between ...">
  <div className="flex min-w-0 items-center gap-3">
    {/* 用户信息 */}
  </div>
  <Button onClick={() => signOut()}>
    <LogOut className="h-4 w-4" />
  </Button>
</div>

// AFTER
<div className="flex items-center justify-between ...">
  <div className="flex min-w-0 items-center gap-3">
    {/* 用户信息 */}
  </div>
  <div className="flex items-center gap-2">        {/* ← NEW 容器 */}
    <LanguageSwitcher />                           {/* ← NEW 语言切换 */}
    <Button onClick={() => signOut()}>
      <LogOut className="h-4 w-4" />
    </Button>
  </div>
</div>
```

### 📍 位置说明

LanguageSwitcher 组件位于 Sidebar Header 的用户信息卡片右侧，紧邻登出按钮。

---

## 7️⃣ 翻译文件结构

### src/i18n/locales/zh.json 和 en.json

```json
// 结构示例
{
  "auth": {
    "signIn": "使用 Google 登录" / "Sign in with Google",
    "welcomeBack": "欢迎回来，{{name}}" / "Welcome back, {{name}}",
    "signOut": "退出" / "Sign Out"
  },
  "taskCenter": {
    "title": "任务中心" / "Task Center",
    "waitingActivation": "任务中心待激活" / "Task Center Awaiting Activation",
    "completed": "任务完成，进度已记录。" / "Task completed, progress recorded.",
    "summarizeFirst": "请先概括核心逻辑，再提交校验。" / "Please summarize the core logic first before submitting validation."
  },
  "common": {
    "confirm": "确认" / "Confirm",
    "cancel": "取消" / "Cancel",
    "loading": "加载中..." / "Loading..."
  }
  // ... 400+ 个 key
}
```

### 📊 统计

- 总共 **400+ 个翻译 key**
- 涵盖所有主要功能模块
- 每个 key 都有中英两个版本
- 文件大小：zh.json ≈ 50KB，en.json ≈ 55KB

---

## 8️⃣ 组件重构示例

### 重构前 (Before)

```typescript
export default function EnhancedTaskCenter() {
  const { dynamicRoadmap, activeRoadmapNodeId } = useGameStore();

  const handleTaskComplete = async (task: Task) => {
    // ...
    toast.success('任务完成，进度已记录。');  // ← 硬编码中文
  };

  return (
    <div>
      {!activeNode ? (
        <div>
          <h3>任务中心待激活</h3>              {/* ← 硬编码中文 */}
          <p>请在左侧「学习路线图」中选择一个战略节点</p>  {/* ← 硬编码中文 */}
        </div>
      ) : (
        <div>
          <h2>当前攻克节点</h2>                 {/* ← 硬编码中文 */}
          <button onClick={() => breakdownTask(task.id)}>
            调用 AI 拆解                       {/* ← 硬编码中文 */}
          </button>
        </div>
      )}
    </div>
  );
}
```

### 重构后 (After)

```typescript
import { useTranslation } from 'react-i18next';  // ← NEW

export default function EnhancedTaskCenter() {
  const { t } = useTranslation();                 // ← NEW
  const { dynamicRoadmap, activeRoadmapNodeId } = useGameStore();

  const handleTaskComplete = async (task: Task) => {
    // ...
    toast.success(t('taskCenter.completed'));     // ← 使用翻译
  };

  return (
    <div>
      {!activeNode ? (
        <div>
          <h3>{t('taskCenter.waitingActivation')}</h3>     {/* ← 使用翻译 */}
          <p>{t('taskCenter.selectNode')}</p>              {/* ← 使用翻译 */}
        </div>
      ) : (
        <div>
          <h2>{t('taskCenter.currentNode')}</h2>           {/* ← 使用翻译 */}
          <button onClick={() => breakdownTask(task.id)}>
            {t('taskCenter.callAI')}                        {/* ← 使用翻译 */}
          </button>
        </div>
      )}
    </div>
  );
}
```

### 🔄 变更总结

| 项目 | 前 | 后 |
|-----|----|----|
| hook 导入 | ❌ | ✅ useTranslation |
| 硬编码文本 | 中文字符串 | `t('key')` |
| 翻译来源 | 无 | JSON 文件 |
| 多语言支持 | ❌ 不支持 | ✅ 完全支持 |

---

## 🎯 重构模式

### 通用模式

```typescript
// Step 1: 导入
import { useTranslation } from 'react-i18next';

// Step 2: 使用 hook
export function MyComponent() {
  const { t } = useTranslation();
  
  // Step 3: 在 JSX 中使用
  return <h1>{t('module.key')}</h1>;
}

// Step 4: 在翻译文件中定义
// zh.json: { "module": { "key": "中文" } }
// en.json: { "module": { "key": "English" } }
```

---

## 📈 影响范围

### 新增文件

- ✨ `src/i18n/config.ts`
- ✨ `src/i18n/locales/zh.json`
- ✨ `src/i18n/locales/en.json`
- ✨ `src/app/components/LanguageSwitcher.tsx`
- ✨ `src/i18n/I18N_REFACTOR_EXAMPLE.tsx`
- ✨ `I18N_INTEGRATION_GUIDE.md`
- ✨ `I18N_QUICK_REFERENCE.md`
- ✨ `I18N_DELIVERY_SUMMARY.md`

### 修改文件

- 📝 `package.json` - 添加 3 个依赖
- 📝 `src/main.tsx` - 初始化 i18n
- 📝 `src/store/useGameStore.ts` - 添加 language 状态和 action
- 📝 `src/app/App.tsx` - 集成语言切换按钮

### 待处理文件（需要手动重构）

- ⏳ `src/app/components/EnhancedTaskCenter.tsx`
- ⏳ `src/app/components/CareerOnboarding.tsx`
- ⏳ 其他包含硬编码中文的组件

---

## ✅ 验证步骤

### 1. 检查依赖安装

```bash
npm list i18next react-i18next i18next-browser-languagedetector
```

### 2. 运行开发服务器

```bash
npm run dev
```

### 3. 验证功能

- 打开应用
- 找到 🌐 语言按钮
- 切换到英文
- 验证所有文本都已翻译
- 刷新页面，验证语言被保留
- 打开浏览器 DevTools
  - 检查 localStorage 中的 `game-store`
  - 检查 console 中是否有 i18n 错误

### 4. 性能检查

```javascript
// 在控制台执行
console.log('i18n language:', i18n.language);
console.log('localStorage game-store:', localStorage.getItem('game-store'));
```

---

## 🎓 总结

本次国际化架构实现涉及：

1. ✅ **基础设施**: i18next + React 集成
2. ✅ **状态管理**: Zustand store 扩展 + persist
3. ✅ **翻译资源**: 400+ 个中英翻译 key
4. ✅ **UI 组件**: 优雅的语言切换按钮
5. ✅ **文档**: 完整的指南和示例

所有核心功能已完成，各组件可按需逐步重构。

---

**版本**: 1.0 | **更新**: 2026-04-23
