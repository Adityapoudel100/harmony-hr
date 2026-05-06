// Safe payroll formula engine using expr-eval (no eval).
// Admins can author dynamic payroll formulas without code deploys.

import { Parser } from "expr-eval";
import type { PayrollResult } from "@/lib/payroll-engine";

export const ALLOWED_VARIABLES = [
  "monthly_salary",
  "gross_salary",
  "basic",
  "allowance",
  "absent_days",
  "unpaid_leave",
  "bonus",
  "extra_time",
  "dashain",
  "pf",
  "cit",
  "ssf",
  "health_insurance",
  "life_insurance",
  "tax",
  "total_deductions",
  "working_days",
  "net_salary",
] as const;

export type FormulaVariable = (typeof ALLOWED_VARIABLES)[number];

export interface CustomFormula {
  id: string;
  name: string;
  formula: string;
  description?: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

const parser = new Parser({
  operators: {
    add: true, subtract: true, multiply: true, divide: true,
    remainder: true, power: true, comparison: true, logical: true,
    conditional: true, in: false, assignment: false,
  },
});

/** Validate formula syntax + that all referenced variables are whitelisted. */
export function validateFormula(formula: string): { valid: boolean; error?: string; variables?: string[] } {
  if (!formula?.trim()) return { valid: false, error: "Formula is empty" };
  try {
    const expr = parser.parse(formula);
    const vars = expr.variables();
    const bad = vars.filter(v => !(ALLOWED_VARIABLES as readonly string[]).includes(v));
    if (bad.length) return { valid: false, error: `Unknown variable(s): ${bad.join(", ")}`, variables: vars };
    return { valid: true, variables: vars };
  } catch (e: any) {
    return { valid: false, error: e?.message ?? "Invalid expression" };
  }
}

/** Build the variable scope from a calculated PayrollResult. */
export function buildScope(r: PayrollResult, workingDays: number): Record<FormulaVariable, number> {
  return {
    monthly_salary: r.monthlySalary,
    gross_salary: r.totalIncome,
    basic: r.basic,
    allowance: r.allowance,
    absent_days: r.absentDays,
    unpaid_leave: r.unpaidLeave,
    bonus: r.bonus,
    extra_time: r.extraTime,
    dashain: r.dashain,
    pf: r.pf,
    cit: r.cit,
    ssf: r.ssf31,
    health_insurance: r.healthInsurance,
    life_insurance: r.lifeInsurance,
    tax: r.monthlyTax,
    total_deductions: r.totalDeduct,
    working_days: workingDays,
    net_salary: r.netPay,
  };
}

/** Evaluate a formula safely against a payroll result. */
export function evaluateFormula(
  formula: string,
  scope: Record<string, number>
): { ok: true; value: number } | { ok: false; error: string } {
  const v = validateFormula(formula);
  if (!v.valid) return { ok: false, error: v.error! };
  try {
    const value = parser.parse(formula).evaluate(scope);
    if (typeof value !== "number" || !isFinite(value)) {
      return { ok: false, error: "Formula did not produce a finite number" };
    }
    return { ok: true, value };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Evaluation error" };
  }
}
