import { useState } from "react";

export const useRolesHook = () => {
    const [roleId, setRoleId]=useState<string>("");
    const [showDeleteDialog, setShowDeleteDialog]=useState<boolean>(false);

    return {
        roleId,
        setRoleId,
        showDeleteDialog,
        setShowDeleteDialog
    }
}