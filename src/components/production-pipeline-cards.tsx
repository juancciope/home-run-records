'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, TrendingUp, FileText } from "lucide-react";
import { AddDataModal } from "./add-data-modal";


// Add Data Action Button Component
function AddDataButton({ 
  section,
  recordType,
  tooltip,
  onRecordAdded
}: { 
  section: 'production' | 'marketing' | 'fan_engagement';
  recordType: string;
  tooltip: string;
  onRecordAdded?: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <AddDataModal
      section={section}
      recordType={recordType}
      onRecordAdded={onRecordAdded}
      open={open}
      onOpenChange={setOpen}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 shrink-0"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only">{tooltip}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </AddDataModal>
  );
}

interface ProductionPipelineCardsProps {
  production: {
    unfinished: number;
    finished: number;
    released: number;
    averageCompletion?: number;
  };
  onRecordAdded?: () => void;
}

export function ProductionPipelineCards({ production, onRecordAdded }: ProductionPipelineCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-orange-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">In Progress</CardTitle>
              <CardDescription className="text-sm">Projects in development</CardDescription>
            </div>
            <div className="flex gap-1">
              <AddDataButton 
                section="production" 
                recordType="unfinished" 
                tooltip="Add new project manually"
                onRecordAdded={onRecordAdded}
              />
            </div>
          </div>
          <div className="text-4xl font-bold">{production?.unfinished || 0}</div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>Progress</span>
              <span className="text-orange-600 font-medium">{production?.averageCompletion || 0}%</span>
            </div>
            <Badge variant="outline" className="text-xs">Active</Badge>
          </div>
          <div className="w-full bg-orange-100 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${production?.averageCompletion || 0}%` }}></div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Focus on completion</span>
          </div>
        </CardHeader>
      </Card>
      
      <Card className="border-yellow-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Ready to Release</CardTitle>
              <CardDescription className="text-sm">Completed, awaiting launch</CardDescription>
            </div>
            <div className="flex gap-1">
              <AddDataButton 
                section="production" 
                recordType="finished" 
                tooltip="Add completed track"
                onRecordAdded={onRecordAdded}
              />
            </div>
          </div>
          <div className="text-4xl font-bold">{production?.finished || 0}</div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>Next Release</span>
              <span className="text-yellow-600 font-medium">2 weeks</span>
            </div>
            <Badge variant="outline" className="text-xs">Ready</Badge>
          </div>
          <div className="w-full bg-yellow-100 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '90%' }}></div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>Schedule releases</span>
          </div>
        </CardHeader>
      </Card>
      
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Live Catalog</CardTitle>
              <CardDescription className="text-sm">Live & generating revenue</CardDescription>
            </div>
            <div className="flex gap-1">
              <AddDataButton 
                section="production" 
                recordType="released" 
                tooltip="Add tracks to catalog"
                onRecordAdded={onRecordAdded}
              />
            </div>
          </div>
          <div className="text-4xl font-bold">{production?.released || 0}</div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>Completion</span>
              <span className="text-green-600 font-medium">100%</span>
            </div>
            <Badge variant="outline" className="text-xs">Live</Badge>
          </div>
          <div className="w-full bg-green-100 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Earning revenue</span>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}