import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AITool } from '@/types/tools';

interface ToolsCompareContextType {
  selectedTools: AITool[];
  isToolSelected: (id: string) => boolean;
  toggleToolSelection: (tool: AITool) => void;
  clearSelectedTools: () => void;
  compareTools: () => void;
  canCompare: boolean;
  removeToolFromComparison: (tool: AITool) => void;
}

const ToolsCompareContext = createContext<ToolsCompareContextType | undefined>(
  undefined
);

export const ToolsCompareProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const MAX_COMPARE_TOOLS = 3;
  const [selectedTools, setSelectedTools] = useState<AITool[]>([]);
  const navigate = useNavigate();
  const canCompare = selectedTools.length >= 2;

  const isToolSelected = (id: string) => {
    return selectedTools.some((tool) => tool.id === id);
  };

  const toggleToolSelection = (tool: AITool) => {
    if (isToolSelected(tool.id)) {
      setSelectedTools((prev) => prev.filter((t) => t.id !== tool.id));
      // toast({
      //   title: 'Tool removed from comparison',
      //   description: `${tool.name} has been removed from comparison.`,
      //   variant: 'default',
      //   duration: 2000, // Short duration to prevent blocking the compare button
      // });
    } else {
      if (selectedTools.length >= MAX_COMPARE_TOOLS) {
        toast.error(
          `You can compare up to ${MAX_COMPARE_TOOLS} tools at once.`
        );
        return;
      }

      setSelectedTools((prev) => [...prev, tool]);
      // toast({
      //   title: "Tool added to comparison",
      //   description: `${tool.name} has been added for comparison.`,
      //   variant: "default",
      //   duration: 2000, // Short duration to prevent blocking the compare button
      // });
    }
  };

  const removeToolFromComparison = (tool: AITool) => {
    setSelectedTools((prev) => prev.filter((t) => t.id !== tool.id));
    // toast({
    //   title: "Tool removed",
    //   description: `${tool.name} has been removed from comparison.`,
    //   variant: "default",
    //   duration: 2000,
    // });
  };

  const clearSelectedTools = () => {
    setSelectedTools([]);
    // toast({
    //   title: "Comparison cleared",
    //   description: "All tools have been removed from comparison.",
    //   variant: "default",
    //   duration: 2000,
    // });
  };

  const compareTools = () => {
    if (selectedTools.length < 2) {
      toast.error('You need to select at least 2 tools to compare.');
      return;
    }

    const toolIds = selectedTools.map((tool) => tool.id).join(',');
    navigate(`/tools/compare/${toolIds}`);
  };

  // Sync with localStorage
  useEffect(() => {
    const storedTools = localStorage.getItem('selectedToolsForCompare');
    if (storedTools) {
      try {
        setSelectedTools(JSON.parse(storedTools));
      } catch (e) {
        console.error('Error parsing stored tools', e);
        localStorage.removeItem('selectedToolsForCompare');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'selectedToolsForCompare',
      JSON.stringify(selectedTools)
    );
  }, [selectedTools]);

  return (
    <ToolsCompareContext.Provider
      value={{
        selectedTools,
        isToolSelected,
        toggleToolSelection,
        clearSelectedTools,
        compareTools,
        canCompare,
        removeToolFromComparison,
      }}
    >
      {children}
    </ToolsCompareContext.Provider>
  );
};

export const useToolsCompare = () => {
  const context = useContext(ToolsCompareContext);
  if (context === undefined) {
    throw new Error(
      'useToolsCompare must be used within a ToolsCompareProvider'
    );
  }
  return context;
};
