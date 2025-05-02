import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { ChatModel } from './ChatInterface';

type ModelSelectorProps = {
  models: ChatModel[];
  selectedModel: ChatModel;
  onSelectModel: (model: ChatModel) => void;
};

const ModelSelector = ({
  models,
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {selectedModel.name}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {models.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onSelectModel(model)}
            >
              {model.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ModelSelector;
