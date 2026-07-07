# Google 登录跳转问题修复

## 问题描述
用户报告Google登录后跳转到旧版本页面或错误的URL。

## 根本原因
1. `signInWithOAuth` 使用了硬编码的 `/auth/callback` 路径作为重定向URL
2. 该路径在应用中不存在，导致重定向失败
3. OAuth回调参数（access_token等）未被正确清理

## 修复内容

### 1. 修复 `src/lib/supabase.ts`

**修改前：**
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

**修改后：**
```typescript
// 获取当前页面的完整URL作为重定向地址
const currentUrl = window.location.origin + window.location.pathname + window.location.search;

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: currentUrl,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
});
```

**改进点：**
- ✅ 使用当前页面URL而非硬编码路径
- ✅ 添加详细的日志记录便于调试
- ✅ 添加queryParams以改善OAuth体验

### 2. 增强 `src/app/App.tsx` 中的认证处理

**修改内容：**
```typescript
// 清理URL中的OAuth参数（hash或search）
if (window.location.hash.includes('access_token=') || window.location.search.includes('code=')) {
  window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
  console.log('[App:onAuthStateChange] Cleaned OAuth parameters from URL');
}
```

**改进点：**
- ✅ 同时处理hash和search参数
- ✅ 添加日志记录便于追踪
- ✅ 确保URL被正确清理

## Supabase 配置要求

### 必须配置的允许重定向URL

在 Supabase Dashboard → Authentication → URL Configuration 中添加：

```
http://localhost:5173/*
https://your-production-domain.com/*
```

或者添加具体URL：
```
http://localhost:5173
http://localhost:5173/
https://your-production-domain.com
https://your-production-domain.com/
```

## 测试步骤

1. **清除浏览器数据**
   ```bash
   # 或在浏览器中手动清除
   - Cookies
   - Local Storage
   - Session Storage
   ```

2. **重启开发服务器**
   ```bash
   npm run dev
   # 或
   pnpm dev
   ```

3. **测试登录流程**
   - 点击Google登录按钮
   - 完成Google授权
   - 确认返回到正确的页面（应该是登录前的页面）
   - 检查URL中不应包含OAuth参数

4. **检查控制台日志**
   应该看到类似以下的日志：
   ```
   [signInWithGoogle] Initiating Google OAuth with redirect to: http://localhost:5173/
   [signInWithGoogle] OAuth initiated successfully
   [App:onAuthStateChange] Auth event: SIGNED_IN
   [App:onAuthStateChange] Cleaned OAuth parameters from URL
   [App:onAuthStateChange] User profile ensured
   [App:onAuthStateChange] User data fetched
   ```

## 常见问题

### Q1: 登录后仍然跳转到错误页面？
**A:** 检查Supabase Dashboard中的Redirect URLs配置是否正确

### Q2: URL中仍有OAuth参数？
**A:** 检查浏览器控制台是否有错误，确认`window.history.replaceState`被正确执行

### Q3: 登录后用户数据未加载？
**A:** 检查`ensureUserProfile`函数是否成功执行，查看Supabase数据库中的users表

## 相关文件
- `src/lib/supabase.ts` - Supabase客户端和认证函数
- `src/app/App.tsx` - 应用主组件和认证状态监听
- `.env.local` - 环境变量配置

## 后续优化建议
1. 添加专门的OAuth回调页面 `/auth/callback` 以提供更好的用户体验
2. 实现登录状态的持久化检查
3. 添加登录失败的友好提示
4. 考虑添加其他OAuth提供商（GitHub、Microsoft等）