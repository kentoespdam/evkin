import { usePage } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

type FlashMessages = {
	success?: string;
	error?: string;
	warning?: string;
	info?: string;
};

type ToastType = "success" | "error" | "warning" | "info";

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
	const flash = page.props.flash as FlashMessages | undefined;

	// Track shown messages to prevent duplicates
	const shownMessagesRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		const newMessages = new Set<string>();

		// Handle flash messages
		if (flash) {
			(["success", "error", "warning", "info"] as ToastType[]).forEach((type) => {
				const message = flash[type];
				if (message) {
					const messageKey = `flash:${type}:${message}`;
					if (!shownMessagesRef.current.has(messageKey)) {
						toast[type](message);
						newMessages.add(messageKey);
					}
				}
			});
		}

		// Handle validation errors
		if (errors && Object.keys(errors).length > 0) {
			// Check for specific 'error' key (from withErrors(['error' => 'message']))
			if ("error" in errors && typeof errors.error === "string") {
				const errorKey = `validation:error:${errors.error}`;
				if (!shownMessagesRef.current.has(errorKey)) {
					toast.error(errors.error);
					newMessages.add(errorKey);
				}
			} else {
				// Handle multiple validation errors
				Object.entries(errors).forEach(([field, message]) => {
					if (typeof message === "string") {
						const errorKey = `validation:${field}:${message}`;
						if (!shownMessagesRef.current.has(errorKey)) {
							toast.error(message, {
								description: field !== "error" ? `Field: ${field}` : undefined,
							});
							newMessages.add(errorKey);
						}
					}
				});
			}
		}

		// Add new messages to shown set
		newMessages.forEach((msg) => {shownMessagesRef.current.add(msg)});

		// Cleanup: Clear old messages after navigation to prevent memory leaks
		return () => {
			if (newMessages.size > 0) {
				// Keep only last 50 messages to prevent unbounded growth
				if (shownMessagesRef.current.size > 50) {
					const messagesArray = Array.from(shownMessagesRef.current);
					shownMessagesRef.current = new Set(messagesArray.slice(-50));
				}
			}
		};
	}, [flash, errors]);
};
