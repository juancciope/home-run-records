"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  Plus,
  Mail,
  Phone,
  UserCheck,
  UserX,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Music,
  Camera,
  Megaphone,
  FileText,
  Headphones,
  TrendingUp
} from "lucide-react"
import { useState } from "react"

interface TeamMember {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  responsibilities: string[]
  status: 'active' | 'pending' | 'inactive'
  joinDate: string
  avatar?: string
}

interface TodoItem {
  id: string
  title: string
  description: string
  assignedTo: string
  dueDate: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

const roleIcons = {
  "Manager": Users,
  "Producer": Music,
  "Sound Engineer": Headphones,
  "Marketing": Megaphone,
  "Social Media": Camera,
  "PR": FileText,
  "Analytics": TrendingUp,
  "General": UserCheck
}

const priorityColors = {
  low: "bg-green-500/10 text-green-600 dark:text-green-400",
  medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", 
  high: "bg-red-500/10 text-red-600 dark:text-red-400"
}

export default function TeamPage() {
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1 (555) 123-4567",
      role: "Manager",
      responsibilities: ["Schedule Management", "Bookings", "Contract Negotiations"],
      status: "active",
      joinDate: "2024-01-15"
    },
    {
      id: "2", 
      name: "Mike Rodriguez",
      email: "mike@example.com",
      role: "Producer",
      responsibilities: ["Music Production", "Recording", "Mixing"],
      status: "active",
      joinDate: "2024-02-01"
    }
  ])

  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: "1",
      title: "Finish new single recording",
      description: "Complete vocals and final mix for upcoming release",
      assignedTo: "2",
      dueDate: "2024-12-20",
      status: "in_progress",
      priority: "high"
    },
    {
      id: "2",
      title: "Social media content calendar",
      description: "Create content calendar for next month's promotion",
      assignedTo: "1",
      dueDate: "2024-12-15",
      status: "todo",
      priority: "medium"
    }
  ])

  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    responsibilities: ""
  })
  const [newTodo, setNewTodo] = useState<{
    title: string
    description: string
    assignedTo: string
    dueDate: string
    priority: 'low' | 'medium' | 'high'
  }>({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium"
  })

  const addTeamMember = () => {
    if (!newMember.name || !newMember.email || !newMember.role) return

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      role: newMember.role,
      responsibilities: newMember.responsibilities.split(',').map(r => r.trim()).filter(r => r),
      status: 'pending',
      joinDate: new Date().toISOString().split('T')[0]
    }

    setTeamMembers(prev => [...prev, member])
    setNewMember({ name: "", email: "", phone: "", role: "", responsibilities: "" })
    setShowAddMember(false)
  }

  const addTodo = () => {
    if (!newTodo.title || !newTodo.assignedTo || !newTodo.dueDate) return

    const todo: TodoItem = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      assignedTo: newTodo.assignedTo,
      dueDate: newTodo.dueDate,
      status: 'todo',
      priority: newTodo.priority
    }

    setTodos(prev => [...prev, todo])
    setNewTodo({ title: "", description: "", assignedTo: "", dueDate: "", priority: "medium" })
    setShowAddTodo(false)
  }

  const updateTodoStatus = (todoId: string, status: TodoItem['status']) => {
    setTodos(prev => prev.map(todo => 
      todo.id === todoId ? { ...todo, status } : todo
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getMemberName = (memberId: string) => {
    return teamMembers.find(m => m.id === memberId)?.name || 'Unassigned'
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and assign responsibilities for your music projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddTodo(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          <Button onClick={() => setShowAddMember(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Members */}
        <div className="space-y-6">
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members ({teamMembers.length})
              </CardTitle>
              <CardDescription>
                Your team members and their assigned responsibilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamMembers.map((member) => {
                const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || UserCheck
                return (
                  <div key={member.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <RoleIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={member.status === 'active' ? 'default' : 'secondary'}
                        className={member.status === 'active' ? 'bg-green-500/10 text-green-700 dark:text-green-400' : ''}
                      >
                        {member.status === 'active' ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                        {member.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Joined {new Date(member.joinDate).toLocaleDateString()}
                      </div>
                    </div>

                    {member.responsibilities.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Responsibilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {member.responsibilities.map((resp, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {resp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Add Member Form */}
              {showAddMember && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3">Add Team Member</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={newMember.name}
                          onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={newMember.phone}
                          onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role *</Label>
                        <select
                          id="role"
                          value={newMember.role}
                          onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select role...</option>
                          <option value="Manager">Manager</option>
                          <option value="Producer">Producer</option>
                          <option value="Sound Engineer">Sound Engineer</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Social Media">Social Media</option>
                          <option value="PR">PR</option>
                          <option value="Analytics">Analytics</option>
                          <option value="General">General</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="responsibilities">Responsibilities</Label>
                      <Input
                        id="responsibilities"
                        value={newMember.responsibilities}
                        onChange={(e) => setNewMember(prev => ({ ...prev, responsibilities: e.target.value }))}
                        placeholder="Separate with commas: Booking, Marketing, Social Media"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addTeamMember} size="sm">
                        Add Member
                      </Button>
                      <Button onClick={() => setShowAddMember(false)} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* To-Do List / Tasks */}
        <div className="space-y-6">
          <Card className="bg-sidebar">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Project Tasks ({todos.length})
              </CardTitle>
              <CardDescription>
                Track tasks and assignments for your team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todos.map((todo) => (
                <div key={todo.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(todo.status)}
                      <div className="flex-1">
                        <h4 className="font-medium">{todo.title}</h4>
                        {todo.description && (
                          <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={priorityColors[todo.priority]}>
                      {todo.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>Assigned to: <strong>{getMemberName(todo.assignedTo)}</strong></span>
                      <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      {todo.status !== 'completed' && (
                        <>
                          {todo.status === 'todo' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => updateTodoStatus(todo.id, 'in_progress')}
                            >
                              Start
                            </Button>
                          )}
                          {todo.status === 'in_progress' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateTodoStatus(todo.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Todo Form */}
              {showAddTodo && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-3">Add New Task</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="todoTitle">Task Title *</Label>
                      <Input
                        id="todoTitle"
                        value={newTodo.title}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Task title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="todoDescription">Description</Label>
                      <Textarea
                        id="todoDescription"
                        value={newTodo.description}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Task description"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="assignTo">Assign To *</Label>
                        <select
                          id="assignTo"
                          value={newTodo.assignedTo}
                          onChange={(e) => setNewTodo(prev => ({ ...prev, assignedTo: e.target.value }))}
                          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select member...</option>
                          {teamMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="dueDate">Due Date *</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newTodo.dueDate}
                          onChange={(e) => setNewTodo(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        value={newTodo.priority}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addTodo} size="sm">
                        Add Task
                      </Button>
                      <Button onClick={() => setShowAddTodo(false)} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'active').length}</div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{todos.filter(t => t.status === 'in_progress').length}</div>
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}