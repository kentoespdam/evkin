import { useState } from "react";

export const useUserHook = () => {
 const [userId, setUserId]=useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog]=useState<boolean>(false);

  return {
    userId,
    setUserId,
    showDeleteDialog,
    setShowDeleteDialog,
  }
}