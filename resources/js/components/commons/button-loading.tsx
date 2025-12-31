import { SaveIcon } from "lucide-react";
import { memo } from "react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

const ButtonLoading = memo(({ processing }: { processing: boolean }) => {
  const icon = processing ? <Spinner /> : <SaveIcon className="h-4 w-4" />;
  const text = processing ? "Saving..." : "Save Changes";
  return (
    <Button type="submit" disabled={processing} className="gap-2 min-w-32">
      {icon}
      {text}
    </Button>
  );
});

ButtonLoading.displayName = "ButtonLoading";

export default ButtonLoading;
