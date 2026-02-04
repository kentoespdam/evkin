import { all, create } from "mathjs";

const createSafeMath = () => {
	const math = create(all, {
		number: "BigNumber",
		precision: 64,
		predictable: true,
	});

	math.config({
		matrix: "Array",
		number: "BigNumber",
		precision: 64,
	});

	return math;
};

const safeMath = createSafeMath();

export const formatCurrency = (amount: number, locale = "id-ID", currency = "IDR"): string => {
	return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount).replace("IDR", "Rp.");
};

export const formatNumber = (value: number, decimals = 0): string => {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return "-";
	}
	return new Intl.NumberFormat("id-ID", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(
		value,
	);
};

export const parseAspectFormula = (formula: string, totalNilaiIndicator: number): number => {
	if (!formula) return 0;

	try {
		const cleanFormula = formula.trim();
		const allowedChars = /^[0-9+\-*/().\s]+$/;

		if (!allowedChars.test(cleanFormula)) {
			console.warn("Formula contains invalid characters:", formula);
			return 0;
		}

		const formulaParts = cleanFormula.split("*");
		if (formulaParts.length === 2) {
			const maxNilai = parseFloat(formulaParts[0].trim() || "0");
			const bobot = parseFloat(formulaParts[1].trim() || "0");

			if (maxNilai === 0) return 0;

			const result = safeMath.evaluate(`(${totalNilaiIndicator} / ${maxNilai}) * ${bobot}`);
			return parseFloat(safeMath.number(result).toFixed(2));
		} else {
			const result = safeMath.evaluate(cleanFormula);
			const maxNilai = safeMath.number(result);

			if (maxNilai === 0) return 0;

			const bobotMatch = cleanFormula.match(/\*\s*(\d+(\.\d+)?)/);
			const bobot = bobotMatch ? parseFloat(bobotMatch[1]) : 1;

			const kinerja = safeMath.evaluate(`(${totalNilaiIndicator} / ${maxNilai}) * ${bobot}`);
			return parseFloat(safeMath.number(kinerja).toFixed(2));
		}
	} catch (error) {
		console.error("Error parsing aspect formula:", formula, error);
		return 0;
	}
};

export const evaluateMathExpression = (expression: string): number => {
	try {
		const result = safeMath.evaluate(expression);
		return safeMath.number(result);
	} catch (error) {
		console.error("Error evaluating math expression:", expression, error);
		return 0;
	}
};

/**
 * 
 * @param formula 
 * @param totalKinerja 
 * 
 * Example Formula
	LTE 30 = "TIDAK BAIK";
	LTE 45 = "KURANG";
	LTE 60 = "CUKUP";
	LTE 75 = "BAIK";
	GT 75 = "BAIK SEKALI";
 */
export const totalKinerjaToKinerja = (totalKinerja?: number, formula?: string | null): string => {
	if (!formula || totalKinerja === undefined || totalKinerja === null) return "";

	const conditions = formula
		.split(";")
		.map((cond) => cond.trim())
		.filter((cond) => cond.length > 0);

	for (const condition of conditions) {
		const [operatorPart, valuePart] = condition.split("=").map((part) => part.trim());
		if (!operatorPart || !valuePart) continue;

		const operatorMatch = operatorPart.match(/^(LTE|GTE|LT|GT|EQ)\s+(.+)$/i);
		if (!operatorMatch) continue;

		const operator = operatorMatch[1].toUpperCase();
		const threshold = parseFloat(operatorMatch[2]);

		if (Number.isNaN(threshold)) continue;

		let conditionMet = false;

		switch (operator) {
			case "LTE":
				conditionMet = totalKinerja <= threshold;
				break;
			case "GTE":
				conditionMet = totalKinerja >= threshold;
				break;
			case "LT":
				conditionMet = totalKinerja < threshold;
				break;
			case "GT":
				conditionMet = totalKinerja > threshold;
				break;
			case "EQ":
				conditionMet = totalKinerja === threshold;
				break;
		}

		if (conditionMet) {
			return valuePart.replace(/^"|"$/g, "");
		}
	}

	return "-";
};

/**
 *
 * @param formula
 * @return formatted formula value
 *
 * Example Formula
 * ( 4176625429.00 / 267543572044.00 ) * 100
 *
 * return formatted if number apply formatNumber
 * Example Output:
 * ( 4.176.625.429,00 / 267.543.572.044,00 ) * 100
 */
export const formatFormulaValue = (formula: string, decimals = 2): string => {
	if (!formula || typeof formula !== "string") return "-";

	try {
		return formula.replace(/\b\d+(\.\d+)?\b/g, (match) => {
			const number = parseFloat(match);
			if (!Number.isNaN(number)) {
				return number > 0 ? formatNumber(number, match.includes(".") ? decimals : 0) : formatNumber(number, 0);
			}
			return match;
		});
	} catch {
		return "-";
	}
};

/**
 * 
 * @param formula 
 * @param value
 * 
 * Example Formula 
	1 = Tidak Memenuhi Syarat;
	2 = Memenuhi Syarat Air Bersih;
	3 = Memenuhi Syarat Air Minum;
 * 
 * example return if value = 2 Memenuhi Syarat Air Bersih
 */
export const formatWithRuleValue = (formula: string, value?: number): string => {
	if (!formula || typeof formula !== "string") return "-";

	try {
		const rules = formula
			.split(";")
			.map((rule) => rule.trim())
			.filter((rule) => rule.length > 0);

		for (const rule of rules) {
			const [numberPart, textPart] = rule.split("=").map((part) => part.trim());
			if (!numberPart || !textPart) continue;

			const ruleNumber = parseFloat(numberPart);
			if (Number.isNaN(ruleNumber)) continue;

			if (ruleNumber === Number(value)) {
				return textPart.replace(/^"|"$/g, "");
			}
		}

		return "";
	} catch {
		return "";
	}
};
