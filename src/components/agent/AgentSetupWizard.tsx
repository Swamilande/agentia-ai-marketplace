import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Building2, 
  Target, 
  Zap, 
  Key,
  Globe,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAgentConfigStore, type AgentSetupConfig } from "@/stores/agentConfigStore";
import { useToast } from "@/hooks/use-toast";

interface AgentSetupWizardProps {
  agentId: string;
  agentName: string;
  userId: string;
  onComplete: (config: AgentSetupConfig) => void;
}

const STEPS = [
  { id: 'business', title: 'Business Info', icon: Building2 },
  { id: 'goals', title: 'Goals & Targets', icon: Target },
  { id: 'integration', title: 'Integration', icon: Zap },
  { id: 'api', title: 'API Keys', icon: Key },
  { id: 'review', title: 'Review & Launch', icon: Check },
];

const INDUSTRIES = [
  'E-commerce', 'SaaS', 'Healthcare', 'Finance', 'Education',
  'Real Estate', 'Manufacturing', 'Consulting', 'Media', 'Other'
];

const GOALS = [
  'Lead Generation', 'Customer Support', 'Sales Automation',
  'Data Analysis', 'Content Creation', 'Process Automation',
  'Marketing', 'HR Management', 'Code Review', 'Research'
];

export const AgentSetupWizard = ({ agentId, agentName, userId, onComplete }: AgentSetupWizardProps) => {
  const { toast } = useToast();
  const { saveConfig, syncConfigToServer } = useAgentConfigStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    targetAudience: '',
    goals: [] as string[],
    webhookUrl: '',
    customPrompt: '',
    dataSource: '',
    apiKeys: {} as Record<string, string>,
  });

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      const config: AgentSetupConfig = {
        agentId,
        userId,
        setupCompleted: true,
        setupData: formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Save locally
      saveConfig(config);
      
      // Sync to server
      await syncConfigToServer(config);
      
      toast({
        title: "Setup Complete!",
        description: `${agentName} is now ready to use.`,
      });
      
      onComplete(config);
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Business Info
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Business Name</label>
              <Input
                value={formData.businessName}
                onChange={(e) => updateFormData('businessName', e.target.value)}
                placeholder="Enter your business name"
                className="bg-muted/30 border-border/50"
              />
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Industry</label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(industry => (
                  <Badge
                    key={industry}
                    variant={formData.industry === industry ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => updateFormData('industry', industry)}
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Target Audience</label>
              <Textarea
                value={formData.targetAudience}
                onChange={(e) => updateFormData('targetAudience', e.target.value)}
                placeholder="Describe your target audience..."
                className="bg-muted/30 border-border/50 min-h-[100px]"
              />
            </div>
          </div>
        );
        
      case 1: // Goals
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-muted-foreground mb-4 block">
                Select your goals (choose multiple)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(goal => (
                  <div
                    key={goal}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.goals.includes(goal)
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/50'
                    }`}
                    onClick={() => toggleGoal(goal)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        formData.goals.includes(goal)
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {formData.goals.includes(goal) && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{goal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 2: // Integration
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                <Globe className="w-4 h-4 inline mr-2" />
                Webhook URL (Optional)
              </label>
              <Input
                value={formData.webhookUrl}
                onChange={(e) => updateFormData('webhookUrl', e.target.value)}
                placeholder="https://your-server.com/webhook"
                className="bg-muted/30 border-border/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Receive real-time updates from your agent
              </p>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Data Source (Optional)
              </label>
              <Input
                value={formData.dataSource}
                onChange={(e) => updateFormData('dataSource', e.target.value)}
                placeholder="Database URL or API endpoint"
                className="bg-muted/30 border-border/50"
              />
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Custom Instructions
              </label>
              <Textarea
                value={formData.customPrompt}
                onChange={(e) => updateFormData('customPrompt', e.target.value)}
                placeholder="Add specific instructions for your agent..."
                className="bg-muted/30 border-border/50 min-h-[120px]"
              />
            </div>
          </div>
        );
        
      case 3: // API Keys
        return (
          <div className="space-y-6">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-sm text-muted-foreground">
                🔐 API keys are encrypted and stored securely. They are never visible in logs or outputs.
              </p>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                OpenAI API Key (Optional)
              </label>
              <Input
                type="password"
                value={formData.apiKeys.openai || ''}
                onChange={(e) => updateFormData('apiKeys', { ...formData.apiKeys, openai: e.target.value })}
                placeholder="sk-..."
                className="bg-muted/30 border-border/50"
              />
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Custom API Key (Optional)
              </label>
              <Input
                type="password"
                value={formData.apiKeys.custom || ''}
                onChange={(e) => updateFormData('apiKeys', { ...formData.apiKeys, custom: e.target.value })}
                placeholder="Your custom API key"
                className="bg-muted/30 border-border/50"
              />
            </div>
          </div>
        );
        
      case 4: // Review
        return (
          <div className="space-y-6">
            <div className="p-6 bg-muted/20 rounded-2xl border border-border/50">
              <h4 className="font-semibold mb-4">Configuration Summary</h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business:</span>
                  <span className="font-medium">{formData.businessName || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry:</span>
                  <span className="font-medium">{formData.industry || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Goals:</span>
                  <span className="font-medium">{formData.goals.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Webhook:</span>
                  <span className="font-medium">{formData.webhookUrl ? 'Configured' : 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Keys:</span>
                  <span className="font-medium">{Object.keys(formData.apiKeys).filter(k => formData.apiKeys[k]).length} added</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-600">Ready to Launch</p>
                  <p className="text-sm text-muted-foreground">
                    Your agent will be configured and ready to use immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
              index < currentStep 
                ? 'bg-primary text-primary-foreground'
                : index === currentStep
                  ? 'bg-primary/20 border-2 border-primary text-primary'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div className={`w-12 lg:w-24 h-0.5 mx-2 ${
                index < currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Step Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">{STEPS[currentStep].title}</h2>
        <p className="text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}
        </p>
      </div>
      
      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="min-h-[300px]"
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        {currentStep < STEPS.length - 1 ? (
          <Button onClick={handleNext} className="gap-2">
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleComplete} 
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Launching...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Launch Agent
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
