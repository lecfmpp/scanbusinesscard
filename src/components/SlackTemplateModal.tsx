import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, RotateCcw } from "lucide-react";

interface SlackTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: string;
  onSave: (template: string) => Promise<void>;
}

const AVAILABLE_VARIABLES = [
  { key: "{name}", label: "Name", icon: "👤" },
  { key: "{title}", label: "Job Title", icon: "💼" },
  { key: "{company}", label: "Company", icon: "🏢" },
  { key: "{email}", label: "Email", icon: "📧" },
  { key: "{phone}", label: "Phone", icon: "📱" },
  { key: "{website}", label: "Website", icon: "🌐" },
];

const DEFAULT_TEMPLATE = `📇 *New Lead from ScanBusinessCard*

👤 *Name:* {name}
💼 *Title:* {title}
🏢 *Company:* {company}
📧 *Email:* {email}
📱 *Phone:* {phone}
🌐 *Website:* {website}`;

const SAMPLE_DATA = {
  "{name}": "John Smith",
  "{title}": "Sales Director",
  "{company}": "Acme Corporation",
  "{email}": "john@acme.com",
  "{phone}": "+1 555-123-4567",
  "{website}": "www.acme.com",
};

const SlackTemplateModal = ({ isOpen, onClose, template, onSave }: SlackTemplateModalProps) => {
  const [currentTemplate, setCurrentTemplate] = useState(template || DEFAULT_TEMPLATE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentTemplate(template || DEFAULT_TEMPLATE);
    }
  }, [isOpen, template]);

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = currentTemplate.substring(0, start) + variable + currentTemplate.substring(end);
      setCurrentTemplate(newText);
      // Focus back and set cursor after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      setCurrentTemplate(prev => prev + variable);
    }
  };

  const getPreview = () => {
    let preview = currentTemplate;
    Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    return preview;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(currentTemplate);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    setCurrentTemplate(DEFAULT_TEMPLATE);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Slack Message</DialogTitle>
          <DialogDescription>
            Design how your leads will appear in Slack. Use variables to insert lead information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Available Variables */}
          <div>
            <label className="text-sm font-medium mb-2 block">Available Variables</label>
            <p className="text-xs text-muted-foreground mb-2">Click to insert at cursor position</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_VARIABLES.map((variable) => (
                <Badge
                  key={variable.key}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5"
                  onClick={() => insertVariable(variable.key)}
                >
                  <span className="mr-1">{variable.icon}</span>
                  {variable.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Template Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Message Template</label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetToDefault}
                className="h-7 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset to Default
              </Button>
            </div>
            <Textarea
              id="template-textarea"
              value={currentTemplate}
              onChange={(e) => setCurrentTemplate(e.target.value)}
              placeholder="Enter your message template..."
              className="min-h-[180px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use *text* for bold in Slack. Variables will be replaced with actual lead data.
            </p>
          </div>

          {/* Live Preview */}
          <div>
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <Card className="p-4 bg-[#1a1d21] text-white border-0">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded bg-[#4A154B] flex items-center justify-center text-white font-bold text-sm shrink-0">
                  SB
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">ScanBusinessCard</span>
                    <span className="text-xs text-gray-400">App</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {getPreview().split(/(\*[^*]+\*)/).map((part, i) => {
                      if (part.startsWith('*') && part.endsWith('*')) {
                        return <strong key={i}>{part.slice(1, -1)}</strong>;
                      }
                      return part;
                    })}
                  </div>
                </div>
              </div>
            </Card>
            <p className="text-xs text-muted-foreground mt-1">
              This is how your message will appear in Slack (with sample data)
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#4A154B] hover:bg-[#4A154B]/90">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SlackTemplateModal;
export { DEFAULT_TEMPLATE };
