'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { templates, PageTemplate } from '@/lib/puck/templates';
import { Palette } from 'lucide-react';

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void;
  onSelectBlank?: () => void;
}

function TemplateCard({ template, onSelect }: { template: PageTemplate; onSelect: () => void }) {
  return (
    <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">{template.name}</CardTitle>
            <CardDescription className="text-xs mt-1">{template.description}</CardDescription>
          </div>
          {template.suggestedPrimaryColor && (
            <div className="flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-muted-foreground" />
              <div
                className="w-4 h-4 rounded border border-border"
                style={{ backgroundColor: template.suggestedPrimaryColor }}
                title={`Suggested color: ${template.suggestedPrimaryColor}`}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 bg-muted/30 rounded-md p-4 mb-4 min-h-[120px] flex items-center justify-center">
          <div className="text-center text-muted-foreground text-xs">
            <div className="font-medium mb-1">{template.name}</div>
            <div className="text-[10px] opacity-75">
              {template.puckData.content.length} sections
            </div>
          </div>
        </div>
        <Button onClick={onSelect} size="sm" className="w-full">
          Use this template
        </Button>
      </CardContent>
    </Card>
  );
}

export function TemplateSelector({ onSelectTemplate, onSelectBlank }: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-1">Choose a Template</h3>
        <p className="text-xs text-muted-foreground">
          Start with a pre-built layout or create your own from scratch. You can customize everything later.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={() => onSelectTemplate(template.id)}
          />
        ))}
        
        {onSelectBlank && (
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] h-full flex flex-col border-dashed">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Blank Page</CardTitle>
              <CardDescription className="text-xs mt-1">
                Start from scratch and build your own layout
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 bg-muted/10 rounded-md p-4 mb-4 min-h-[120px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                <div className="text-center text-muted-foreground text-xs">
                  <div className="font-medium">Empty canvas</div>
                  <div className="text-[10px] opacity-75 mt-1">
                    Add sections as needed
                  </div>
                </div>
              </div>
              <Button onClick={onSelectBlank} size="sm" variant="outline" className="w-full">
                Start blank
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

