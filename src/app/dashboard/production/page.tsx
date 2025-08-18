"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverEvent,
  UniqueIdentifier,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Music, 
  Calendar, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  PlayCircle,
  Loader2,
  Plus,
  MoreVertical,
  Radio,
  Headphones,
  Edit3,
  Trash2,
  Eye
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ProductionRecord {
  id: string
  record_type: 'unfinished' | 'finished' | 'released'
  title: string
  artist_name?: string
  description?: string
  completion_percentage: number
  release_date?: string
  platforms?: any[]
  metadata?: any
  created_at: string
  updated_at: string
}

interface GroupedRecords {
  unfinished: ProductionRecord[]
  finished: ProductionRecord[]
  released: ProductionRecord[]
}

// Sortable Card Component
function SortableCard({ 
  record, 
  onEdit, 
  onDelete 
}: { 
  record: ProductionRecord
  onEdit: (record: ProductionRecord) => void
  onDelete: (recordId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: record.id,
    data: {
      type: 'task',
      task: record
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3"
    >
      <Card className="cursor-move hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Music className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{record.title}</h4>
                {record.artist_name && (
                  <p className="text-xs text-muted-foreground">{record.artist_name}</p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(record)
                  }}
                >
                  <Edit3 className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="h-3 w-3 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(record.id)
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {record.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {record.description}
            </p>
          )}

          <div className="space-y-2">
            {record.completion_percentage > 0 && record.record_type === 'unfinished' && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{record.completion_percentage}%</span>
                </div>
                <Progress value={record.completion_percentage} className="h-1" />
              </div>
            )}

            {record.release_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(record.release_date).toLocaleDateString()}</span>
              </div>
            )}

            {record.platforms && record.platforms.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {record.platforms.map((platform, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Droppable Column Component
function KanbanColumn({ 
  title, 
  status, 
  records, 
  icon: Icon,
  color,
  onEdit,
  onDelete
}: { 
  title: string
  status: string
  records: ProductionRecord[]
  icon: any
  color: string
  onEdit: (record: ProductionRecord) => void
  onDelete: (recordId: string) => void
}) {
  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: status,
    data: {
      type: 'column',
      column: { id: status, title }
    },
  })

  // Ensure records is always an array
  const safeRecords = records || []

  return (
    <div className="flex-1 min-w-[300px]">
      <Card className={`h-full ${isOver ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">{title}</CardTitle>
                <p className="text-xs text-muted-foreground">{safeRecords.length} items</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent ref={setNodeRef} className="min-h-[400px]">
          <SortableContext 
            items={safeRecords.map(r => r.id)} 
            strategy={verticalListSortingStrategy}
          >
            {safeRecords.map((record) => (
              <SortableCard 
                key={record.id} 
                record={record} 
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
          
          {safeRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Icon className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No items</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProductionPage() {
  const router = useRouter()
  const [records, setRecords] = useState<GroupedRecords>({
    unfinished: [],
    finished: [],
    released: []
  })
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    artist_name: '',
    description: '',
    completion_percentage: 0,
    release_date: '',
    platforms: [] as string[]
  })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingRecord, setDeletingRecord] = useState<ProductionRecord | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/dashboard/production')
      const data = await response.json()
      
      if (data.success) {
        // Ensure all arrays are defined
        setRecords({
          unfinished: data.data.unfinished || [],
          finished: data.data.finished || [],
          released: data.data.released || []
        })
      } else {
        console.error('API Error:', data.error)
        if (data.error === 'Unauthorized') {
          toast.error('Please log in to view production records')
        } else {
          toast.error('Failed to load production records')
        }
      }
    } catch (error) {
      console.error('Error fetching records:', error)
      toast.error('Failed to load production records')
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeId = active.id
    const overId = over.id
    
    if (activeId === overId) return

    // Find the active record
    const activeRecord = findRecordById(activeId as string)
    if (!activeRecord) return

    // Determine if we're dropping on a column or card
    const isOverAColumn = over.data?.current?.type === 'column'
    const isOverATask = over.data?.current?.type === 'task'

    if (!isOverAColumn && !isOverATask) return

    // If dropping on a column, move to that column
    if (isOverAColumn) {
      const newColumnId = overId as string
      if (activeRecord.record_type !== newColumnId) {
        setRecords(prev => {
          const newRecords = { ...prev }
          
          // Remove from old column
          const oldStatus = activeRecord.record_type as keyof GroupedRecords
          newRecords[oldStatus] = (newRecords[oldStatus] || []).filter(r => r.id !== activeId)
          
          // Add to new column
          const updatedRecord = { ...activeRecord, record_type: newColumnId as any }
          const newStatus = newColumnId as keyof GroupedRecords
          newRecords[newStatus] = [...(newRecords[newStatus] || []), updatedRecord]
          
          return newRecords
        })
      }
    }
    
    // If dropping on a task, move to that task's column
    if (isOverATask) {
      const overRecord = findRecordById(overId as string)
      if (overRecord && activeRecord.record_type !== overRecord.record_type) {
        setRecords(prev => {
          const newRecords = { ...prev }
          
          // Remove from old column
          const oldStatus = activeRecord.record_type as keyof GroupedRecords
          newRecords[oldStatus] = (newRecords[oldStatus] || []).filter(r => r.id !== activeId)
          
          // Add to new column
          const updatedRecord = { ...activeRecord, record_type: overRecord.record_type }
          const newStatus = overRecord.record_type as keyof GroupedRecords
          newRecords[newStatus] = [...(newRecords[newStatus] || []), updatedRecord]
          
          return newRecords
        })
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    
    if (!over) return

    const activeRecord = findRecordById(active.id as string)
    if (!activeRecord) return

    // Determine the target status
    let targetStatus: string
    if (over.data?.current?.type === 'column') {
      targetStatus = over.id as string
    } else {
      const overRecord = findRecordById(over.id as string)
      targetStatus = overRecord?.record_type || activeRecord.record_type
    }

    // Only update database if status actually changed
    if (activeRecord.record_type !== targetStatus) {
      console.log('🎯 Starting database update:', {
        recordId: activeRecord.id,
        newStatus: targetStatus,
        from: activeRecord.record_type,
        to: targetStatus
      })
      
      try {

        const response = await fetch('/api/dashboard/production', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordId: activeRecord.id,
            newStatus: targetStatus
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('❌ API Error:', errorData)
          throw new Error(errorData.error || 'Failed to update')
        }

        const responseData = await response.json()
        console.log('✅ Successfully updated record:', responseData)

        toast.success(`Moved "${activeRecord.title}" to ${getColumnTitle(targetStatus)}`)
      } catch (error) {
        console.error('❌ Error updating record:', error)
        toast.error('Failed to update record status')
        // Revert by refetching
        await fetchRecords()
      }
    } else {
      console.log('🔄 No status change detected:', {
        current: activeRecord.record_type,
        target: targetStatus
      })
    }
  }

  const findRecordById = (id: string): ProductionRecord | undefined => {
    const allRecords = [
      ...(records.unfinished || []),
      ...(records.finished || []),
      ...(records.released || [])
    ]
    return allRecords.find(record => record.id === id)
  }

  const getColumnTitle = (status: string) => {
    switch (status) {
      case 'unfinished': return 'In-progress'
      case 'finished': return 'Ready to Release'
      case 'released': return 'Live Catalog'
      default: return status
    }
  }

  const handleEdit = (record: ProductionRecord) => {
    setEditingRecord(record)
    setEditFormData({
      title: record.title,
      artist_name: record.artist_name || '',
      description: record.description || '',
      completion_percentage: record.completion_percentage,
      release_date: record.release_date ? record.release_date.split('T')[0] : '',
      platforms: record.platforms || []
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingRecord) return

    try {
      const response = await fetch('/api/dashboard/production', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId: editingRecord.id,
          updates: {
            title: editFormData.title,
            artist_name: editFormData.artist_name,
            description: editFormData.description,
            completion_percentage: editFormData.completion_percentage,
            release_date: editFormData.release_date,
            platforms: editFormData.platforms
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update record')
      }

      toast.success('Record updated successfully')
      setIsEditModalOpen(false)
      setEditingRecord(null)
      await fetchRecords() // Refresh the data
      setRefreshKey(prev => prev + 1) // Force re-render
    } catch (error) {
      console.error('Error updating record:', error)
      toast.error('Failed to update record')
    }
  }

  const handleDelete = (recordId: string) => {
    const record = findRecordById(recordId)
    if (record) {
      setDeletingRecord(record)
      setIsDeleteDialogOpen(true)
    }
  }

  const confirmDelete = async () => {
    if (!deletingRecord) return
    
    try {
      const response = await fetch('/api/dashboard/production', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId: deletingRecord.id })
      })

      if (!response.ok) {
        throw new Error('Failed to delete')
      }

      // First close the dialog and clear state
      setIsDeleteDialogOpen(false)
      setDeletingRecord(null)
      
      toast.success('Record deleted successfully')
      
      // Then refresh the data
      await fetchRecords()
      setRefreshKey(prev => prev + 1) // Force re-render
      
      // Force a small delay to ensure state is properly updated
      setTimeout(() => {
        // This ensures React has time to properly reconcile the component tree
      }, 100)
      
    } catch (error) {
      console.error('Error deleting record:', error)
      toast.error('Failed to delete record')
      setIsDeleteDialogOpen(false)
      setDeletingRecord(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const activeRecord = activeId ? findRecordById(activeId as string) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-3xl font-bold">Production Dashboard</h1>
          <p className="text-muted-foreground">
            Track your music production workflow and releases
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/production/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{records.unfinished?.length || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ready</p>
                <p className="text-2xl font-bold">{records.finished?.length || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Released</p>
                <p className="text-2xl font-bold">{records.released?.length || 0}</p>
              </div>
              <Radio className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4" key={refreshKey}>
          <KanbanColumn 
            key={`unfinished-${refreshKey}`}
            title="In-progress"
            status="unfinished"
            records={records.unfinished}
            icon={Clock}
            color="bg-orange-500"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <KanbanColumn 
            key={`finished-${refreshKey}`}
            title="Ready to Release"
            status="finished"
            records={records.finished}
            icon={CheckCircle2}
            color="bg-blue-500"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <KanbanColumn 
            key={`released-${refreshKey}`}
            title="Live Catalog"
            status="released"
            records={records.released}
            icon={Radio}
            color="bg-green-500"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
        
        <DragOverlay>
          {activeRecord ? (
            <Card className="cursor-move shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  <span className="font-medium">{activeRecord.title}</span>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit Record Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder="Song or album title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="artist_name">Artist Name</Label>
              <Input
                id="artist_name"
                value={editFormData.artist_name}
                onChange={(e) => setEditFormData({ ...editFormData, artist_name: e.target.value })}
                placeholder="Artist or band name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Brief description or notes"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="completion_percentage">Completion Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="completion_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={editFormData.completion_percentage}
                  onChange={(e) => setEditFormData({ ...editFormData, completion_percentage: parseInt(e.target.value) || 0 })}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="release_date">Release Date</Label>
              <Input
                id="release_date"
                type="date"
                value={editFormData.release_date}
                onChange={(e) => setEditFormData({ ...editFormData, release_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editFormData.title}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingRecord?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}