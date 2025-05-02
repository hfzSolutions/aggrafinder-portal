
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings } from 'lucide-react';
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

  const handleModelChange = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    if (model) {
      onSelectModel(model);
    }
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-sm mx-auto">
      <Select value={selectedModel.id} onValueChange={handleModelChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={selectedModel.name} />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
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
