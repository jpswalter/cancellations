import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

// Определяем типы для контекста
interface TableRowAnimationContextType {
  closingRowId: string | null;
  closeRow: (id: string | null) => void;
}

// Создаем контекст с типом, который может быть либо нашим типом, либо undefined
const TableRowAnimationContext = createContext<
  TableRowAnimationContextType | undefined
>(undefined);

// Провайдер для контекста
export const TableRowAnimationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [closingRowId, setClosingRowId] = useState<string | null>(null);

  const closeRow = useCallback((id: string | null) => {
    setClosingRowId(id);
  }, []);

  return (
    <TableRowAnimationContext.Provider value={{ closingRowId, closeRow }}>
      {children}
    </TableRowAnimationContext.Provider>
  );
};

// Кастомный хук для использования контекста
export const useTableRowAnimation = (): TableRowAnimationContextType => {
  const context = useContext(TableRowAnimationContext);

  if (context === undefined) {
    throw new Error(
      'useTableRowAnimation must be used within a TableRowAnimationProvider',
    );
  }

  return context;
};
