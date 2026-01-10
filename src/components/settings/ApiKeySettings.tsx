import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useApiKeyStore } from '@/stores/apiKeyStore';
import { useToast } from '@/hooks/use-toast';

interface ApiKeySettingsProps {
  trigger?: React.ReactNode;
}

export const ApiKeySettings = ({ trigger }: ApiKeySettingsProps) => {
  const { toast } = useToast();
  const {
    geminiApiKey,
    openaiApiKey,
    defaultProvider,
    setGeminiApiKey,
    setOpenaiApiKey,
    setDefaultProvider,
    hasGeminiKey,
    hasOpenaiKey,
    clearKeys,
  } = useApiKeyStore();

  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [geminiInput, setGeminiInput] = useState(geminiApiKey);
  const [openaiInput, setOpenaiInput] = useState(openaiApiKey);
  const [open, setOpen] = useState(false);

  const hasEnvGemini = !!import.meta.env.VITE_GEMINI_API_KEY;
  const hasEnvOpenai = !!import.meta.env.VITE_OPENAI_API_KEY;

  const handleSave = () => {
    setGeminiApiKey(geminiInput);
    setOpenaiApiKey(openaiInput);
    toast({
      title: 'API Keys Saved',
      description: 'Your API keys have been saved securely in browser storage.',
    });
    setOpen(false);
  };

  const handleClear = () => {
    clearKeys();
    setGeminiInput('');
    setOpenaiInput('');
    toast({
      title: 'API Keys Cleared',
      description: 'Your API keys have been removed.',
    });
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            API Key Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your LLM API keys. Keys are stored securely in your browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Default Provider */}
          <div className="space-y-2">
            <Label>Default Provider</Label>
            <Select value={defaultProvider} onValueChange={(v) => setDefaultProvider(v as 'gemini' | 'openai')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="openai">OpenAI GPT-4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <div className="flex items-center gap-2">
                {hasEnvGemini && (
                  <Badge variant="secondary" className="text-xs">
                    ENV configured
                  </Badge>
                )}
                {hasGeminiKey() ? (
                  <Badge className="bg-green-500/20 text-green-400 text-xs gap-1">
                    <Check className="w-3 h-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Missing
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="gemini-key"
                  type={showGemini ? 'text' : 'password'}
                  value={geminiInput}
                  onChange={(e) => setGeminiInput(e.target.value)}
                  placeholder={hasEnvGemini ? 'Using environment variable' : 'Enter your Gemini API key'}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <div className="flex items-center gap-2">
                {hasEnvOpenai && (
                  <Badge variant="secondary" className="text-xs">
                    ENV configured
                  </Badge>
                )}
                {hasOpenaiKey() ? (
                  <Badge className="bg-green-500/20 text-green-400 text-xs gap-1">
                    <Check className="w-3 h-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Missing
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="openai-key"
                  type={showOpenai ? 'text' : 'password'}
                  value={openaiInput}
                  onChange={(e) => setOpenaiInput(e.target.value)}
                  placeholder={hasEnvOpenai ? 'Using environment variable' : 'Enter your OpenAI API key'}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenai(!showOpenai)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-muted/50 border border-border/50"
          >
            <h4 className="text-sm font-medium mb-2">🔒 Security Note</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• API keys are stored locally in your browser</li>
              <li>• Keys are never sent to our servers</li>
              <li>• Environment variables take precedence if set</li>
              <li>• Clear browser data to remove stored keys</li>
            </ul>
          </motion.div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleClear} className="gap-2 text-destructive">
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Check className="w-4 h-4" />
              Save Keys
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
