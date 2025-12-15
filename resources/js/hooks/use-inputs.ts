import { useState } from "react";

export const useInputsHook = () => {
    const [id, setId] = useState<string>("");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    return {
        id,
        setId,
        showDeleteDialog,
        setShowDeleteDialog,
    };
};