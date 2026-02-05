// Utility untuk format angka dan mata uang
export const formatCurrency = (amount: number, locale = "id-ID", currency = "IDR"): string => {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	})
		.format(amount)
		.replace("IDR", "Rp.");
};

export const formatNumber = (value: number | null | undefined, decimals = 0): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "-";
  }
  return new Intl.NumberFormat("id-ID", { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  }).format(value);
};

// Helper untuk validasi ekspresi matematika yang aman
const createSafeMathEvaluator = () => {
	// Karakter yang diizinkan untuk ekspresi matematika
	const ALLOWED_CHARS = /^[\d+\-*/().\s]+$/;

	// Kata kunci JavaScript yang diblokir
	const BLOCKED_KEYWORDS = [
		"alert",
		"console",
		"debugger",
		"document",
		"eval",
		"fetch",
		"Function",
		"import",
		"localStorage",
		"location",
		"Math",
		"process",
		"prompt",
		"require",
		"sessionStorage",
		"setTimeout",
		"setInterval",
		"window",
		"XMLHttpRequest",
		"constructor",
		"prototype",
		"__proto__",
	];

	const isSafeExpression = (expression: string): boolean => {
		// 1. Validasi karakter yang diizinkan
		if (!ALLOWED_CHARS.test(expression)) {
			return false;
		}

		// 2. Cegah multiple statements
		if (expression.includes(";") || expression.includes(",") || expression.includes("return")) {
			return false;
		}

		// 3. Cegah kata kunci berbahaya (case-insensitive)
		const lowerExpression = expression.toLowerCase();
		return !BLOCKED_KEYWORDS.some((keyword) => lowerExpression.includes(keyword.toLowerCase()));
	};

	const evaluateBasicMath = (expression: string): number => {
		try {
			// Validasi keamanan
			if (!isSafeExpression(expression)) {
				throw new Error("Expression contains unsafe characters or patterns");
			}

			// Gunakan Function constructor dengan scope yang terisolasi
			// Ini lebih aman daripada eval karena membuat fungsi baru dengan scope yang bersih
			const fn = new Function(
				"",
				`
        "use strict";
        try {
          return (${expression});
        } catch(e) {
          throw new Error('Invalid mathematical expression');
        }
      `,
			);

			const result = fn();

			// Validasi hasil
			if (typeof result !== "number" || !Number.isFinite(result)) {
				throw new Error("Result is not a valid number");
			}

			return result;
		} catch (error) {
			console.error("Error evaluating expression:", expression, error);
			throw error;
		}
	};

	return {
		evaluate: evaluateBasicMath,
		isSafeExpression,
	};
};

const safeMath = createSafeMathEvaluator();

// Fungsi untuk parsing formula aspect dengan validasi yang ketat
export const parseAspectFormula = (formula: string, totalNilaiIndicator: number): number => {
	if (!formula || formula.trim() === "") return 0;

	try {
		const cleanFormula = formula.trim();

		// 1. Parsing manual untuk format "maxNilai * bobot"
		const formulaParts = cleanFormula.split("*").map((part) => part.trim());

		if (formulaParts.length === 2) {
			const maxNilai = parseFloat(formulaParts[0]);
			const bobot = parseFloat(formulaParts[1]);

			// Validasi input
			if (Number.isNaN(maxNilai) || Number.isNaN(bobot)) {
				console.warn("Invalid numbers in formula:", formula);
				return 0;
			}

			if (maxNilai === 0) return 0;

			// Hitung dengan presisi yang tinggi
			const result = (totalNilaiIndicator / maxNilai) * bobot;

			// Rounding dengan presisi 2 digit
			return Math.round(result * 100) / 100;
		}

		// 2. Untuk formula kompleks, gunakan evaluator aman
		if (!safeMath.isSafeExpression(cleanFormula)) {
			console.warn("Unsafe formula expression:", formula);
			return 0;
		}

		// Evaluasi formula untuk mendapatkan maxNilai
		const maxNilai = safeMath.evaluate(cleanFormula);

		if (maxNilai === 0 || Number.isNaN(maxNilai) || !Number.isFinite(maxNilai)) {
			return 0;
		}

		// Cari bobot dalam formula (jika ada)
		const bobotMatch = cleanFormula.match(/\*\s*([\d.]+)/);
		const bobot = bobotMatch ? parseFloat(bobotMatch[1]) : 1;

		const result = (totalNilaiIndicator / maxNilai) * bobot;
		return Math.round(result * 100) / 100;
	} catch (error) {
		console.error("Error parsing aspect formula:", formula, error);
		return 0;
	}
};

// Fungsi alternatif yang lebih sederhana untuk formula umum
export const parseSimpleAspectFormula = (formula: string, totalNilaiIndicator: number): number => {
	if (!formula || formula.trim() === "") return 0;

	const cleanFormula = formula.trim();
	const parts = cleanFormula.split("*").map((p) => p.trim());

	// Format: "maxNilai * bobot"
	if (parts.length === 2) {
		const maxNilai = parseFloat(parts[0]);
		const bobot = parseFloat(parts[1]);

		if (Number.isNaN(maxNilai) || Number.isNaN(bobot)) {
			console.warn("Invalid formula format:", formula);
			return 0;
		}

		if (maxNilai === 0) return 0;

		// Hitung langsung dengan JavaScript
		const result = (totalNilaiIndicator / maxNilai) * bobot;
		return Math.round(result * 100) / 100;
	}

	// Format lain, coba parse sebagai angka tunggal
	const maxNilai = parseFloat(cleanFormula);
	if (!Number.isNaN(maxNilai) && maxNilai !== 0) {
		const result = (totalNilaiIndicator / maxNilai) * 100; // Default bobot 100%
		return Math.round(result * 100) / 100;
	}

	return 0;
};

export const evaluateMathExpression = (expression: string): number => {
	try {
		if (!safeMath.isSafeExpression(expression)) {
			throw new Error("Unsafe expression");
		}

		const result = safeMath.evaluate(expression);

		// Validasi hasil
		if (typeof result !== "number" || !Number.isFinite(result)) {
			throw new Error("Invalid result");
		}

		return result;
	} catch (error) {
		console.error("Error evaluating math expression:", expression, error);
		return 0;
	}
};

// Evaluasi ekspresi matematika yang lebih aman untuk operasi sederhana
export const evaluateSimpleMath = (expression: string): number => {
	try {
		// Hanya izinkan karakter angka dan operator dasar
		const sanitizedExpression = expression.replace(/[^\d+\-*/().\s]/g, "");

		// Split untuk mengecek multiple statements
		if (sanitizedExpression.includes(";")) {
			throw new Error("Multiple statements not allowed");
		}

		// Gunakan math evaluator aman
		return safeMath.evaluate(sanitizedExpression);
	} catch (error) {
		console.error("Error in simple math evaluation:", expression, error);
		return 0;
	}
};

/**
 * Konversi total kinerja ke label kinerja berdasarkan formula
 *
 * @param totalKinerja Nilai total kinerja
 * @param formula Contoh: "LTE 30 = 'TIDAK BAIK'; LTE 45 = 'KURANG'; LTE 60 = 'CUKUP'; LTE 75 = 'BAIK'; GT 75 = 'BAIK SEKALI'"
 * @returns Label kinerja
 */
export const totalKinerjaToKinerja = (totalKinerja?: number, formula?: string | null): string => {
	if (!formula || totalKinerja === undefined || totalKinerja === null) return "";

	// Parsing kondisi
	const conditions = formula
		.split(";")
		.map((cond) => cond.trim())
		.filter((cond) => cond.length > 0);

	for (const condition of conditions) {
		const [operatorPart, valuePart] = condition.split("=").map((part) => part.trim());
		if (!operatorPart || !valuePart) continue;

		// Parse operator dan threshold
		const operatorMatch = operatorPart.match(/^(LTE|GTE|LT|GT|EQ)\s+([\d.]+)$/i);
		if (!operatorMatch) continue;

		const operator = operatorMatch[1].toUpperCase();
		const threshold = parseFloat(operatorMatch[2]);

		if (Number.isNaN(threshold)) continue;

		// Evaluasi kondisi
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
				conditionMet = Math.abs(totalKinerja - threshold) < 0.001; // Toleransi floating point
				break;
			default:
				continue;
		}

		if (conditionMet) {
			// Hapus tanda kutip
			return valuePart.replace(/^['"]|['"]$/g, "");
		}
	}

	return "-";
};

/**
 * Format formula dengan angka yang diformat
 *
 * @param formula Contoh: "( 4176625429.00 / 267543572044.00 ) * 100"
 * @param decimals Jumlah desimal
 * @returns Formula dengan angka yang diformat: "( 4.176.625.429,00 / 267.543.572.044,00 ) * 100"
 */
export const formatFormulaValue = (formula: string, decimals = 2): string => {
	if (!formula || typeof formula !== "string") return "-";

	try {
		// Regex untuk menemukan angka (termasuk desimal)
		return formula.replace(/\b\d[\d.]*\b/g, (match) => {
			// Cek apakah ini angka valid
			const number = parseFloat(match);
			if (Number.isNaN(number)) return match;

			// Format berdasarkan apakah ada desimal
			const hasDecimal = match.includes(".");
			return formatNumber(number, hasDecimal ? decimals : 0);
		});
	} catch {
		return "-";
	}
};

/**
 * Format nilai berdasarkan aturan
 *
 * @param formula Contoh: "1 = Tidak Memenuhi Syarat; 2 = Memenuhi Syarat Air Bersih; 3 = Memenuhi Syarat Air Minum"
 * @param value Nilai yang akan diformat
 * @returns Teks sesuai aturan
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

			// Periksa kesamaan dengan toleransi floating point
			if (Math.abs(ruleNumber - (value || 0)) < 0.001) {
				return textPart.replace(/^['"]|['"]$/g, "");
			}
		}

		return "";
	} catch {
		return "";
	}
};

// Fungsi bantu tambahan untuk validasi dan konversi
// biome-ignore lint/suspicious/noExplicitAny: Any Data
export const isValidNumber = (value: any): value is number => {
	return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
};

export const roundToDecimals = (value: number, decimals: number = 2): number => {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
};

// Ekspor evaluator aman untuk penggunaan khusus
export const safeMathEvaluator = safeMath;
