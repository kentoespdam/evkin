import { useState } from "react";

export const useRoleInputsHook=()=>{
    const [id, setId]=useState<string>("");
    const [showDeleteDialog, setShowDeleteDialog]=useState<boolean>(false);

    return {
        id,
        setId,
        showDeleteDialog,
        setShowDeleteDialog
    }
}