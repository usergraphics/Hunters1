// View Toggle Component

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
  className?: string;
}

export function ViewToggle({ viewMode, onChange, className }: ViewToggleProps) {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-muted rounded-lg', className)}>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => onChange('grid')}
        className="h-8 w-8"
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="icon"
        onClick={() => onChange('list')}
        className="h-8 w-8"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default ViewToggle;
