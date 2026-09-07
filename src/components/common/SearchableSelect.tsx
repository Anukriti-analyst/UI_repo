import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SearchableSelectOption {
  value: number;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  emptyMessage?: string;
  noMatchMessage?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = '— Select —',
  emptyMessage = 'No options available',
  noMatchMessage = 'No matching options found',
  disabled = false,
}: SearchableSelectProps) {
  const [open, setOpen]         = useState(false);
  const [query, setQuery]       = useState('');
  const [dropRect, setDropRect] = useState<DOMRect | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  const selected     = options.find((o) => o.value === value);
  const inputDisplay = open ? query : (selected?.label ?? '');

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const updateRect = useCallback(() => {
    if (containerRef.current) setDropRect(containerRef.current.getBoundingClientRect());
  }, []);

  /* Close on outside click — check both the container and the portal list */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      const portal = document.getElementById('ss-portal-list');
      if (portal?.contains(target)) return;
      setOpen(false);
      setQuery('');
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Reposition on scroll / resize while open */
  useEffect(() => {
    if (!open) return;
    const onUpdate = () => updateRect();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [open, updateRect]);

  const handleFocus = () => {
    if (disabled) return;
    updateRect();
    setOpen(true);
    setQuery('');
  };

  const handleSelect = (opt: SearchableSelectOption) => {
    onChange(opt.value);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(0);
    setQuery('');
    updateRect();
    setOpen(false);
    inputRef.current?.blur();
  };

  /* Portal list — teleported to document.body to escape overflow:auto containers */
  const portalList = open && dropRect
    ? createPortal(
        <ul
          id="ss-portal-list"
          role="listbox"
          style={{
            position: 'fixed',
            top: dropRect.bottom + 4,
            left: dropRect.left,
            width: dropRect.width,
            zIndex: 9999,
          }}
          className="max-h-72 overflow-y-auto rounded-lg border border-[#E0E0E5] bg-white shadow-lg py-1"
        >
          {options.length === 0 ? (
            <li className="px-3 py-2.5 text-xs italic text-[#999]">{emptyMessage}</li>
          ) : filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-xs italic text-[#999]">{noMatchMessage}</li>
          ) : (
            filtered.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt)}
                className={[
                  'flex flex-col px-3 py-2 text-sm cursor-pointer select-none',
                  opt.value === value
                    ? 'bg-[#EEF4FF] text-[#0057CA] font-medium'
                    : 'text-[#1A1A2E] hover:bg-[#F5F7FF]',
                ].join(' ')}
              >
                <span>{opt.label}</span>
                {opt.sublabel && (
                  <span className="text-[10px] text-[#999] mt-0.5">{opt.sublabel}</span>
                )}
              </li>
            ))
          )}
        </ul>,
        document.body,
      )
    : null;

  return (
    <div ref={containerRef}>
      {/* Combobox input — search is always visible inline, never inside a clipped panel */}
      <div
        onClick={() => { if (!disabled) { updateRect(); setOpen(true); inputRef.current?.focus(); } }}
        className={[
          'w-full flex items-center px-3 py-2 text-sm rounded-lg border bg-white transition-colors',
          disabled
            ? 'border-[#E0E0E5] bg-[#F8F8FA] cursor-not-allowed opacity-60'
            : open
              ? 'border-[#0073E6] ring-2 ring-[#0073E6] cursor-text'
              : 'border-[#E0E0E5] hover:border-[#0073E6] cursor-text',
        ].join(' ')}
      >
        <Search size={13} className="shrink-0 mr-2 text-[#AAAAAA] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={inputDisplay}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          style={{ outline: 'none', boxShadow: 'none' }}
          className="flex-1 min-w-0 bg-transparent ring-0 text-sm text-[#1A1A2E] placeholder:text-[#AAAAAA] disabled:cursor-not-allowed"
          aria-haspopup="listbox"
          aria-expanded={open}
        />
        {selected && !open ? (
          <button
            type="button"
            onClick={handleClear}
            tabIndex={-1}
            className="shrink-0 ml-1 p-0.5 rounded text-[#AAAAAA] hover:text-[#666] focus:outline-none"
            aria-label="Clear selection"
          >
            <X size={12} />
          </button>
        ) : (
          <ChevronDown
            size={14}
            className={`shrink-0 ml-1 text-[#AAAAAA] transition-transform duration-200 pointer-events-none ${open ? 'rotate-180' : ''}`}
          />
        )}
      </div>

      {portalList}
    </div>
  );
}
