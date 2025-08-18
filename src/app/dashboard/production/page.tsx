"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
  UniqueIdentifier
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
  Disc,
  Radio,
  Headphones
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
function SortableCard({ record }: { record: ProductionRecord }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: record.id })

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
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreVertical className="h-3 w-3" />
            </Button>
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
  color 
}: { 
  title: string
  status: string
  records: ProductionRecord[]
  icon: any
  color: string
}) {
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  })

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
                <p className="text-xs text-muted-foreground">{records.length} items</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent ref={setNodeRef} className="min-h-[400px]">
          <SortableContext 
            items={records.map(r => r.id)} 
            strategy={verticalListSortingStrategy}
          >
            {records.map((record) => (
              <SortableCard key={record.id} record={record} />
            ))}
          </SortableContext>
          
          {records.length === 0 && (
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
        setRecords(data.data)
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

    const activeRecord = findRecordById(active.id as string)
    const overStatus = over.data?.current?.sortable?.containerId || over.id

    if (activeRecord && overStatus && activeRecord.record_type !== overStatus) {
      // Move record to new column immediately for smooth UX
      setRecords(prev => {
        const newRecords = { ...prev }
        
        // Remove from old column
        newRecords[activeRecord.record_type as keyof GroupedRecords] = 
          newRecords[activeRecord.record_type as keyof GroupedRecords].filter(r => r.id !== activeRecord.id)
        
        // Add to new column
        const updatedRecord = { ...activeRecord, record_type: overStatus as any }
        newRecords[overStatus as keyof GroupedRecords] = [
          ...newRecords[overStatus as keyof GroupedRecords],
          updatedRecord
        ]
        
        return newRecords
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) {
      setActiveId(null)
      return
    }

    const activeRecord = findRecordById(active.id as string)
    const overStatus = over.data?.current?.sortable?.containerId || over.id

    if (activeRecord && overStatus && activeRecord.record_type !== overStatus) {
      // Update in database
      try {
        const response = await fetch('/api/dashboard/production', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordId: activeRecord.id,
            newStatus: overStatus
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update')
        }

        toast.success(`Moved "${activeRecord.title}" to ${getColumnTitle(overStatus as string)}`)
      } catch (error) {
        console.error('Error updating record:', error)
        toast.error('Failed to update record status')
        // Revert the change
        await fetchRecords()
      }
    }

    setActiveId(null)
  }

  const findRecordById = (id: string): ProductionRecord | undefined => {
    return [...records.unfinished, ...records.finished, ...records.released]
      .find(record => record.id === id)
  }

  const getColumnTitle = (status: string) => {
    switch (status) {
      case 'unfinished': return 'In-progress'
      case 'finished': return 'Ready to Release'
      case 'released': return 'Live Catalog'
      default: return status
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{records.unfinished.length}</p>
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
                <p className="text-2xl font-bold">{records.finished.length}</p>
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
                <p className="text-2xl font-bold">{records.released.length}</p>
              </div>
              <Radio className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">
                  {records.unfinished.length + records.finished.length + records.released.length}
                </p>
              </div>
              <Disc className="h-8 w-8 text-purple-500 opacity-20" />
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
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn 
            title="In-progress"
            status="unfinished"
            records={records.unfinished}
            icon={Clock}
            color="bg-orange-500"
          />
          <KanbanColumn 
            title="Ready to Release"
            status="finished"
            records={records.finished}
            icon={CheckCircle2}
            color="bg-blue-500"
          />
          <KanbanColumn 
            title="Live Catalog"
            status="released"
            records={records.released}
            icon={Radio}
            color="bg-green-500"
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
    </div>
  )
}