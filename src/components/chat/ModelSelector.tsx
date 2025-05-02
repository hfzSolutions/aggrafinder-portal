
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, ChevronDown } from 'lucide-react';
import { ChatModel } from './ChatInterface';

type ModelSelectorProps = {
  models: ChatModel[];
  selectedModel: ChatModel;
  onSelectModel: (model: ChatModel) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
};

const ModelSelector = ({
  models,
  selectedModel,
  onSelectModel,
  apiKey,
  onApiKeyChange,
}: ModelSelectorProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey);

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

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chat Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-sm font-medium">
                OpenRouter API Key
              </label>
              <Input
                id="api-key"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                type="password"
                placeholder="Enter your API key..."
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  OpenRouter.ai
                </a>
              </p>
            </div>
            <Button
              onClick={() => {
                onApiKeyChange(keyInput);
                setIsSettingsOpen(false);
              }}
              className="w-full"
            >
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelSelector;
