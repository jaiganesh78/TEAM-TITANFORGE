import { LibraryQuestion } from './QuestionLibrary';

export class QuestionEngine {
  /**
   * Validates user input against a library question's validation rules.
   */
  static validate(question: LibraryQuestion, value: any): { valid: boolean; error?: string } {
    const valRules = question.validation;
    if (!valRules) {
      return { valid: true };
    }

    // Required check
    if (valRules.required) {
      if (value === undefined || value === null || value === '') {
        return { valid: false, error: `${question.title} is required.` };
      }
    }

    if (value === undefined || value === null || value === '') {
      return { valid: true };
    }

    // Number range checks
    if (question.type === 'number') {
      const numVal = Number(value);
      if (isNaN(numVal)) {
        return { valid: false, error: 'Value must be a number.' };
      }
      if (valRules.min !== undefined && numVal < valRules.min) {
        return { valid: false, error: `Value must be at least ${valRules.min}.` };
      }
      if (valRules.max !== undefined && numVal > valRules.max) {
        return { valid: false, error: `Value must be at most ${valRules.max}.` };
      }
    }

    // Pattern regex check
    if (question.type === 'text' && valRules.pattern) {
      const regex = new RegExp(valRules.pattern);
      if (!regex.test(String(value))) {
        return { valid: false, error: 'Value format is invalid.' };
      }
    }

    return { valid: true };
  }

  /**
   * Extracts the current value of a question from the nested Business profile object.
   * Path: e.g. "marketingProfile.adSpend" => business.marketingProfile.adSpend
   */
  static extractValue(business: any, path: string): any {
    if (!business || !path) return null;
    const parts = path.split('.');
    let current = business;
    for (const part of parts) {
      if (current === null || current === undefined) {
        return null;
      }
      current = current[part];
    }
    return current ?? null;
  }
}
