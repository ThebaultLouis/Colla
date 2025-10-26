import { createContext, useContext, useState, ReactNode } from 'react';

interface RefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  expandedItems: Set<string>;
  toggleExpanded: (id: string) => void;
  isExpanded: (id: string) => boolean;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isExpanded = (id: string) => {
    return expandedItems.has(id);
  };

  return (
    <RefreshContext.Provider value={{ refreshTrigger, triggerRefresh, expandedItems, toggleExpanded, isExpanded }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within RefreshProvider');
  }
  return context;
}
