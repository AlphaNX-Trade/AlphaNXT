export type AssetTab = 'overview' | 'chart' | 'news' | 'financials' | 'ai';

const TABS: { id: AssetTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'chart', label: 'Chart' },
  { id: 'news', label: 'News' },
  { id: 'financials', label: 'Financials' },
  { id: 'ai', label: 'AI Analysis' },
];

interface AssetTabsProps {
  active: AssetTab;
  onChange: (tab: AssetTab) => void;
}

export function AssetTabs({ active, onChange }: AssetTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-border">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`shrink-0 px-3.5 py-2.5 font-mono text-xs font-medium border-b-2 transition-colors ${
            active === tab.id
              ? 'text-primary border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
