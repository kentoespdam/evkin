/**
 *
 * @param formula
 * @param value
 * contoh formula
 * 1 = Tidak Memenuhi Syarat
 * 2 = Memenuhi Syarat Air Bersih
 * 3 = Memenuhi Syarat Air Minum
 */
export const evaluateRulesOptions = (formula?: string | null, value?: number) => {
	if (!formula || value === undefined) return null;

	const options = formula.split("\n").map((option) => {
		const [optionValue, ...optionLabelParts] = option.trim().split("=");
		const optionLabel = optionLabelParts.join("=").trim();
		return { value: parseFloat(optionValue.trim()), label: optionLabel };
	});

	const matchedOption = options.find((option) => Number(option.value) === Number(value));
	return matchedOption ? matchedOption.label : null;
};
