import { memo } from "react";

const StarRequired = memo(() => {
	return (
		<>
			<span className="text-destructive">*</span>
			<span className="text-xs text-muted-foreground font-normal">(Wajib diisi)</span>
		</>
	);
});
StarRequired.displayName = "StarRequired";

export default StarRequired;
