# 前端权限系统使用指南

## 权限数据来源
权限信息直接编码在JWT token中，无需额外API调用。

## 使用方法

### 1. 路由保护

```typescript
import { requireAuth, requireRole, requirePermission } from '@/utils/routeProtection'

// 需要登录
export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  component: DashboardPage,
})

// 需要特定角色
export const Route = createFileRoute('/admin/')({
  beforeLoad: requireRole('admin'),
  component: AdminDashboard,
})

// 需要moderator角色
export const Route = createFileRoute('/moderate/')({
  beforeLoad: requireRole('moderator'),
  component: ModerateDashboard,
})

// 需要特定权限
export const Route = createFileRoute('/users')({
  beforeLoad: requirePermission('users:read'),
  component: UsersPage,
})

// 需要多个角色之一
export const Route = createFileRoute('/staff/')({
  beforeLoad: requireAnyRole('admin', 'moderator', 'editor'),
  component: StaffDashboard,
})
```

### 2. 组件内权限检查

```typescript
import { authManager } from '@/utils/auth'

function MyComponent() {
  // 检查是否登录
  if (!authManager.isAuthenticated()) {
    return <div>Please login</div>
  }
  
  // 检查角色
  if (authManager.hasRole('admin')) {
    return <AdminView />
  }
  
  // 检查权限
  if (authManager.hasPermission('posts:write')) {
    return <EditButton />
  }
  
  // 检查多个权限（任一）
  if (authManager.hasAnyRole(['admin', 'moderator'])) {
    return <ModeratorTools />
  }
}
```

### 3. 条件渲染

```tsx
{authManager.isAdmin() && (
  <Button>Admin Only Action</Button>
)}

{authManager.hasPermission('posts:delete') && (
  <DeleteButton />
)}
```

### 4. 获取用户信息

```typescript
const user = authManager.getUser()
// {
//   user_id: 123,
//   user_uuid: "abc-123",
//   email: "user@example.com",
//   permissions: ["role:user", "posts:read"]
// }
```

## 权限格式

- 角色权限：`role:admin`, `role:user`, `role:moderator`
- 资源权限：`resource:action`，如 `posts:write`, `users:delete`
- 通配符：`posts:*`（所有posts操作）, `*`（超级管理员）

## 注意事项

1. **权限已在JWT中** - 不需要调用 `/api/v1/me/permissions`
2. **权限修改后需重新登录** - 后端会吊销session，强制获取新token
3. **401/403自动处理** - axios拦截器会自动处理未授权和禁止访问

## 已废弃的API

以下API已不再需要，因为权限信息在JWT中：
- ❌ `GET /api/v1/me/permissions` 
- ❌ `GET /api/v1/me/roles`

管理员API仍然可用：
- ✅ `GET /api/v1/admin/users/:id/permissions` - 查看其他用户权限
- ✅ `POST /api/v1/admin/users/:id/permissions` - 修改其他用户权限