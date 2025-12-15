import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Custom hook to display toast notifications for Laravel flash messages
 * Automatically shows error and success messages when Laravel redirects with:
 * - withErrors(['error' => 'message'])
 * - with('success', 'message')
 * - with('warning', 'message')
 * - with('info', 'message')
 */
export const useErrorToast = () => {
  const page = usePage();
  const { errors } = page.props;
  const flash = page.props.flash as { success?: string; error?: string; warning?: string; info?: string } | undefined;
  
  // Track shown messages to prevent duplicates
  const shownMessagesRef = useRef<Set<string>>(new Set());

  // Combined effect for all flash messages
  useEffect(() => {
    const currentMessages = new Set<string>();

    // Handle success messages
    if (flash?.success && !shownMessagesRef.current.has(`success:${flash.success}`)) {
      toast.success(flash.success);
      currentMessages.add(`success:${flash.success}`);
    }

    // Handle flash error messages
    if (flash?.error && !shownMessagesRef.current.has(`error:${flash.error}`)) {
      toast.error(flash.error);
      currentMessages.add(`error:${flash.error}`);
    }

    // Handle warning messages
    if (flash?.warning && !shownMessagesRef.current.has(`warning:${flash.warning}`)) {
      toast.warning(flash.warning);
      currentMessages.add(`warning:${flash.warning}`);
    }

    // Handle info messages
    if (flash?.info && !shownMessagesRef.current.has(`info:${flash.info}`)) {
      toast.info(flash.info);
      currentMessages.add(`info:${flash.info}`);
    }

    // Update shown messages
    currentMessages.forEach(msg => shownMessagesRef.current.add(msg));
  }, [flash?.success, flash?.error, flash?.warning, flash?.info]);

  // Handle validation errors
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      // Check for specific 'error' key (from withErrors(['error' => 'message']))
      if ('error' in errors && typeof errors.error === 'string') {
        const errorKey = `validation:error:${errors.error}`;
        if (!shownMessagesRef.current.has(errorKey)) {
          toast.error(errors.error);
          shownMessagesRef.current.add(errorKey);
        }
      } else {
        // If there are multiple validation errors, show them all
        Object.entries(errors).forEach(([field, message]) => {
          if (typeof message === 'string') {
            const errorKey = `validation:${field}:${message}`;
            if (!shownMessagesRef.current.has(errorKey)) {
              toast.error(message, {
                description: field !== 'error' ? `Field: ${field}` : undefined,
              });
              shownMessagesRef.current.add(errorKey);
            }
          }
        });
      }
    }
  }, [errors]);
};
