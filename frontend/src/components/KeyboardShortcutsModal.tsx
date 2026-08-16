import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Lightbulb } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { category: 'Tools', items: [
    { keys: ['D'], description: 'Switch to Draw tool' },
    { keys: ['E'], description: 'Switch to Erase tool' },
    { keys: ['C'], description: 'Clear entire canvas' },
  ]},
  { category: 'Intensity', items: [
    { keys: ['1'], description: 'Set intensity to 1' },
    { keys: ['2'], description: 'Set intensity to 2' },
    { keys: ['3'], description: 'Set intensity to 3' },
    { keys: ['4'], description: 'Set intensity to 4' },
  ]},
  { category: 'History', items: [
    { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
    { keys: ['Ctrl', 'Y'], description: 'Redo action' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo action (alternative)' },
  ]},
  { category: 'Help', items: [
    { keys: ['?'], description: 'Show this help menu' },
    { keys: ['Esc'], description: 'Close dialogs' },
  ]},
];

export default function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <Badge
                          key={keyIdx}
                          variant="secondary"
                          className="font-mono text-xs px-2 py-1"
                        >
                          {key}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
            <span>
              <strong>Tip:</strong> Press <Badge variant="secondary" className="mx-1 font-mono">?</Badge> anytime to view these shortcuts
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
