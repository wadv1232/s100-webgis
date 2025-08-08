'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole, Permission } from '@prisma/client'
import { USER_SCENARIOS } from '@/lib/auth/permissions'
import { mockUsers, mockNodes } from '@/mock-data'
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  Database, 
  Settings,
  Activity,
  Anchor,
  Map,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react'

interface User {
  id: string
  email: string
  username: string
  name?: string
  role: UserRole
  nodeId?: string
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  permissions?: Permission[]
}

interface Node {
  id: string
  name: string
  type: string
  level: number
}

export default function UsersPage() {
  const { user, hasPermission } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [nodes, setNodes] = useState<Node[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    role: UserRole.USER,
    nodeId: '',
    isActive: true,
    permissions: [] as Permission[]
  })

  // Check permissions
  const canReadUsers = hasPermission(Permission.USER_READ)
  const canCreateUsers = hasPermission(Permission.USER_CREATE)
  const canUpdateUsers = hasPermission(Permission.USER_UPDATE)
  const canDeleteUsers = hasPermission(Permission.USER_DELETE)

  useEffect(() => {
    if (!canReadUsers) return
    
    loadUsers()
    loadNodes()
  }, [canReadUsers])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      // Use organized mock data - replace with API call
      setUsers(mockUsers)
    } catch (err) {
      setError('加载用户数据失败')
    } finally {
      setIsLoading(false)
    }
  }

  const loadNodes = async () => {
    try {
      // Use organized mock nodes data
      setNodes(mockNodes)
    } catch (err) {
      console.error('加载节点数据失败:', err)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-500'
      case UserRole.NODE_ADMIN:
        return 'bg-orange-500'
      case UserRole.DATA_MANAGER:
        return 'bg-green-500'
      case UserRole.SERVICE_MANAGER:
        return 'bg-blue-500'
      case UserRole.USER:
        return 'bg-gray-500'
      case UserRole.GUEST:
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return '系统管理员'
      case UserRole.NODE_ADMIN:
        return '节点管理员'
      case UserRole.DATA_MANAGER:
        return '数据管理员'
      case UserRole.SERVICE_MANAGER:
        return '服务管理员'
      case UserRole.USER:
        return '普通用户'
      case UserRole.GUEST:
        return '游客'
      default:
        return '未知'
    }
  }

  const getNodeName = (nodeId?: string) => {
    if (!nodeId) return '未分配'
    const node = nodes.find(n => n.id === nodeId)
    return node?.name || '未知节点'
  }

  const getScenarioForRole = (role: UserRole) => {
    return USER_SCENARIOS.find(scenario => scenario.defaultRole === role)
  }

  const handleCreateUser = async () => {
    if (!canCreateUsers) return

    try {
      setIsLoading(true)
      // Mock API call - replace with real API
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
      }
      
      setUsers(prev => [...prev, newUser])
      setSuccess('用户创建成功')
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (err) {
      setError('创建用户失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!canUpdateUsers || !editingUser) return

    try {
      setIsLoading(true)
      // Mock API call - replace with real API
      const updatedUser = { ...editingUser, ...formData }
      
      setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u))
      setSuccess('用户更新成功')
      setIsEditDialogOpen(false)
      resetForm()
    } catch (err) {
      setError('更新用户失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!canDeleteUsers) return

    if (!confirm('确定要删除此用户吗？')) return

    try {
      setIsLoading(true)
      // Mock API call - replace with real API
      setUsers(prev => prev.filter(u => u.id !== userId))
      setSuccess('用户删除成功')
    } catch (err) {
      setError('删除用户失败')
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      username: user.username,
      name: user.name || '',
      role: user.role,
      nodeId: user.nodeId || '',
      isActive: user.isActive,
      permissions: user.permissions || []
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      name: '',
      role: UserRole.USER,
      nodeId: '',
      isActive: true,
      permissions: []
    })
    setEditingUser(null)
  }

  if (!canReadUsers) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            您没有权限访问用户管理页面。
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-gray-600 mt-2">
            管理系统用户、角色和权限分配
          </p>
        </div>
        
        {canCreateUsers && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                创建用户
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>创建新用户</DialogTitle>
                <DialogDescription>
                  填写用户基本信息和分配角色权限
                </DialogDescription>
              </DialogHeader>
              <UserForm
                formData={formData}
                setFormData={setFormData}
                nodes={nodes}
                onSubmit={handleCreateUser}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            搜索和筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">搜索用户</Label>
              <Input
                id="search"
                placeholder="输入邮箱、用户名或姓名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Label htmlFor="role-filter">角色筛选</Label>
              <Select value={roleFilter} onValueChange={(value: UserRole | 'ALL') => setRoleFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">所有角色</SelectItem>
                  {Object.values(UserRole).map(role => (
                    <SelectItem key={role} value={role}>
                      {getRoleName(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Scenarios Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            用户场景参考
          </CardTitle>
          <CardDescription>
            不同用户场景对应的默认角色和权限
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {USER_SCENARIOS.map((scenario, index) => {
              const ScenarioIcon = {
                Anchor: Anchor,
                Database: Database,
                Map: Map,
                Settings: Shield,
                Activity: Activity
              }[scenario.icon || 'Anchor'] || Anchor
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ScenarioIcon className={`h-5 w-5 text-${scenario.color}-600`} />
                    <h3 className="font-medium">{scenario.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-xs">
                      默认角色: {getRoleName(scenario.defaultRole)}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      权限数量: {scenario.permissions.length}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>
            当前系统中的所有用户 ({filteredUsers.length} 个用户)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户信息</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>所属节点</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>用户场景</TableHead>
                  <TableHead>最后登录</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const scenario = getScenarioForRole(user.role)
                  const ScenarioIcon = scenario ? {
                    Anchor: Anchor,
                    Database: Database,
                    Map: Map,
                    Settings: Shield,
                    Activity: Activity
                  }[scenario.icon || 'Anchor'] || Anchor : null
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name || user.username}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div className="text-xs text-gray-500">@{user.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{getNodeName(user.nodeId)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={user.isActive} disabled />
                          <span className="text-sm">{user.isActive ? '激活' : '禁用'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {scenario && ScenarioIcon && (
                          <div className="flex items-center gap-2">
                            <ScenarioIcon className={`h-4 w-4 text-${scenario.color}-600`} />
                            <span className="text-sm">{scenario.name}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastLoginAt ? 
                            new Date(user.lastLoginAt).toLocaleDateString('zh-CN') : 
                            '从未登录'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {canUpdateUsers && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeleteUsers && user.role !== UserRole.ADMIN && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>
              修改用户信息和权限分配
            </DialogDescription>
          </DialogHeader>
          <UserForm
            formData={formData}
            setFormData={setFormData}
            nodes={nodes}
            onSubmit={handleUpdateUser}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={isLoading}
            isEdit
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface UserFormProps {
  formData: any
  setFormData: (data: any) => void
  nodes: Node[]
  onSubmit: () => void
  onCancel: () => void
  isLoading: boolean
  isEdit?: boolean
}

function UserForm({ formData, setFormData, nodes, onSubmit, onCancel, isLoading, isEdit = false }: UserFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">邮箱 *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="user@example.com"
          disabled={isEdit}
        />
      </div>
      
      <div>
        <Label htmlFor="username">用户名 *</Label>
        <Input
          id="username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="username"
          disabled={isEdit}
        />
      </div>
      
      <div>
        <Label htmlFor="name">姓名</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="真实姓名"
        />
      </div>
      
      <div>
        <Label htmlFor="role">角色 *</Label>
        <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(UserRole).map(role => (
              <SelectItem key={role} value={role}>
                {role === UserRole.ADMIN ? '系统管理员' :
                 role === UserRole.NODE_ADMIN ? '节点管理员' :
                 role === UserRole.DATA_MANAGER ? '数据管理员' :
                 role === UserRole.SERVICE_MANAGER ? '服务管理员' :
                 role === UserRole.USER ? '普通用户' :
                 role === UserRole.GUEST ? '游客' : role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="nodeId">所属节点</Label>
        <Select value={formData.nodeId} onValueChange={(value) => setFormData({ ...formData, nodeId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="选择节点" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">未分配</SelectItem>
            {nodes.map(node => (
              <SelectItem key={node.id} value={node.id}>
                {node.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">激活用户</Label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading ? '保存中...' : isEdit ? '更新' : '创建'}
        </Button>
      </div>
    </div>
  )
}