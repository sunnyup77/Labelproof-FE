// Rule display metadata — names and citations from DECISIONS.md §3
// These are static display strings only. The backend is the source of truth for
// rule results; this file is for the FE to render human-readable labels.

import type { RuleId } from '../types/contracts';

export interface RuleMeta {
  id: RuleId;
  name: string;
  citation: string;
  description: string;
  method: 'extraction' | 'extraction+format' | 'geometry' | 'ocr';
}

export const RULE_META: Record<RuleId, RuleMeta> = {
  R1: {
    id: 'R1',
    name: 'Manufacturer name & address',
    citation: 'Rules 6(1)(a), 10(1) — LMPC (PC) Rules, 2011',
    description: 'Manufacturer/packer/importer name + complete address (street, city/state or PIN)',
    method: 'extraction+format',
  },
  R2: {
    id: 'R2',
    name: 'Generic name of commodity',
    citation: 'Rule 6(1)(b) — LMPC (PC) Rules, 2011',
    description: 'Common or generic name of the packaged commodity must be declared',
    method: 'extraction',
  },
  R3: {
    id: 'R3',
    name: 'Net quantity — correct unit',
    citation: 'Rules 6(1)(c), 13 — LMPC (PC) Rules, 2011',
    description: 'Net quantity in correct unit (<1 kg → grams, <1 L → ml; no dozen/score/gross)',
    method: 'extraction+format',
  },
  R4: {
    id: 'R4',
    name: 'Month & year of manufacture',
    citation: 'Rule 6(1)(d) — LMPC (PC) Rules, 2011',
    description: 'Month and year of manufacture in valid format (MM/YYYY, MON/YYYY, or words)',
    method: 'extraction+format',
  },
  R5: {
    id: 'R5',
    name: 'MRP prescribed wording',
    citation: 'Rules 2(m), 6(1)(e) — LMPC (PC) Rules, 2011',
    description: 'MRP must read: "Maximum Retail Price Rs. X (inclusive of all taxes)"',
    method: 'extraction+format',
  },
  R6: {
    id: 'R6',
    name: 'Consumer care details',
    citation: 'Rule 6(2) — LMPC (PC) Rules, 2011',
    description: 'Consumer care phone number or email address must be declared',
    method: 'extraction',
  },
  R7: {
    id: 'R7',
    name: 'Language of declarations',
    citation: 'Rule 9(4) — LMPC (PC) Rules, 2011',
    description: 'Mandatory declarations must be in Hindi (Devanagari) or English',
    method: 'ocr',
  },
  R8: {
    id: 'R8',
    name: 'Minimum numeral height',
    citation: 'Rule 7(2) + Table-I (GSR 629(E), w.e.f. 1.1.2018) — LMPC (PC) Rules, 2011',
    description: 'MRP/quantity numerals must meet minimum height per principal display panel area class',
    method: 'geometry',
  },
  R9: {
    id: 'R9',
    name: 'Clear space around quantity',
    citation: 'Rule 8 — LMPC (PC) Rules, 2011',
    description: 'Clear space of ≥1× numeral height above/below and ≥2× left/right of quantity declaration',
    method: 'geometry',
  },
  R10: {
    id: 'R10',
    name: 'Numeral contrast',
    citation: 'Rule 9(1)(b) — LMPC (PC) Rules, 2011',
    description: 'MRP/quantity numerals must contrast conspicuously with background',
    method: 'geometry',
  },
  R11: {
    id: 'R11',
    name: 'No misleading quantity qualifiers',
    citation: 'Rule 12(6) — LMPC (PC) Rules, 2011',
    description: 'Quantity declaration must not contain qualifiers like "minimum", "approx", "average"',
    method: 'extraction+format',
  },
};

export const RULE_IDS: RuleId[] = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11'];
