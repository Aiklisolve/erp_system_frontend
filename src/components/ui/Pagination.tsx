type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (page > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (page < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-1 py-1 text-[11px] text-slate-600">
      <button
        type="button"
        disabled={!canPrev}
        onClick={() => canPrev && onChange(page - 1)}
        className="px-2.5 py-1 rounded-md disabled:opacity-40 hover:bg-slate-100 transition-colors font-medium"
      >
        Prev
      </button>
      
      <div className="h-4 w-px bg-slate-200 mx-1" />
      
      {/* Page Numbers */}
      {pageNumbers.map((pageNum, index) => (
        pageNum === '...' ? (
          <span key={`ellipsis-${index}`} className="px-1.5 text-slate-400">...</span>
        ) : (
          <button
            key={pageNum}
            type="button"
            onClick={() => onChange(pageNum as number)}
            className={`min-w-[28px] px-2 py-1 rounded-md transition-colors font-medium ${
              page === pageNum
                ? 'bg-primary text-white'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            {pageNum}
          </button>
        )
      ))}
      
      <div className="h-4 w-px bg-slate-200 mx-1" />
      
      <button
        type="button"
        disabled={!canNext}
        onClick={() => canNext && onChange(page + 1)}
        className="px-2.5 py-1 rounded-md disabled:opacity-40 hover:bg-slate-100 transition-colors font-medium"
      >
        Next
      </button>
    </div>
  );
}


