import React from 'react';
import { useAtom } from 'jotai';
import { filterTextAtom, filterKeywordsAtom, filterDueSoonAtom } from '@/stores/appStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Clock } from 'lucide-react';

export function FilterBar() {
  const [filterText, setFilterText] = useAtom(filterTextAtom);
  const [filterKeywords, setFilterKeywords] = useAtom(filterKeywordsAtom);
  const [filterDueSoon, setFilterDueSoon] = useAtom(filterDueSoonAtom);

  const clearFilters = () => {
    setFilterText('');
    setFilterKeywords('');
    setFilterDueSoon(false);
  };

  const hasActiveFilters = filterText || filterKeywords || filterDueSoon;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Text Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        {/* Keyword Filters */}
        <div className="flex-1">
          <Input
            placeholder="Filter by keywords (e.g., weight=3, priority=Q1, role=Student)"
            value={filterKeywords}
            onChange={(e) => setFilterKeywords(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Due Soon Toggle and Clear Filters */}
        <div className="flex gap-2">
          <Button
            variant={filterDueSoon ? "default" : "outline"}
            onClick={() => setFilterDueSoon(!filterDueSoon)}
            className="gap-2 text-xs sm:text-sm flex-1 sm:flex-none"
          >
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Due Soon</span>
            <span className="sm:hidden">Due</span>
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="gap-2 text-xs sm:text-sm"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Clear</span>
              <span className="sm:hidden">×</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filterText && (
            <Badge variant="secondary" className="gap-1">
              Text: {filterText}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilterText('')}
              />
            </Badge>
          )}
          {filterKeywords && (
            <Badge variant="secondary" className="gap-1">
              Keywords: {filterKeywords}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilterKeywords('')}
              />
            </Badge>
          )}
          {filterDueSoon && (
            <Badge variant="secondary" className="gap-1">
              Due Soon
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilterDueSoon(false)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
