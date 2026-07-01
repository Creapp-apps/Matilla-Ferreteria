import { useEffect } from 'react';

type KeyboardShortcutHandlers = {
  [key: string]: (e: KeyboardEvent) => void;
};

/**
 * Custom React Hook to register and manage keyboard shortcuts globally.
 * 
 * @param handlers - Mapping of keyboard keys (e.g. 'F2', 'Escape') to callback handlers.
 * @param active - Boolean indicating whether keyboard listeners are active.
 */
export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  active: boolean = true
) {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const handler = handlers[event.key];
      if (handler) {
        // Prevent default actions for operational hotkeys (e.g., F5 refreshing the POS, F3 browser search)
        if (['F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9'].includes(event.key)) {
          event.preventDefault();
        }
        handler(event);
      }
    };

    const handleCustomTrigger = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      const key = customEvent.detail;
      const handler = handlers[key];
      if (handler) {
        handler({ key } as KeyboardEvent);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('trigger-shortcut', handleCustomTrigger);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('trigger-shortcut', handleCustomTrigger);
    };
  }, [handlers, active]);
}
export default useKeyboardShortcuts;
