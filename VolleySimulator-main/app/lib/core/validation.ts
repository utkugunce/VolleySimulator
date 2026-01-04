/**
 * Validation utilities using simple schema-based validation
 * Lightweight alternative to Zod for basic validation needs
 */

// ============================================
// VALIDATION RESULT TYPES
// ============================================

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: string[];
}

// ============================================
// BASIC VALIDATORS
// ============================================

export const validators = {
    // String validators
    string: {
        required: (value: unknown, message = 'Bu alan zorunludur'): string | null => {
            if (typeof value !== 'string' || value.trim() === '') return message;
            return null;
        },
        minLength: (min: number) => (value: string, message = `En az ${min} karakter olmalı`): string | null => {
            if (value.length < min) return message;
            return null;
        },
        maxLength: (max: number) => (value: string, message = `En fazla ${max} karakter olmalı`): string | null => {
            if (value.length > max) return message;
            return null;
        },
        email: (value: string, message = 'Geçerli bir e-posta adresi girin'): string | null => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return message;
            return null;
        },
        pattern: (regex: RegExp, message: string) => (value: string): string | null => {
            if (!regex.test(value)) return message;
            return null;
        }
    },

    // Number validators
    number: {
        required: (value: unknown, message = 'Bu alan zorunludur'): string | null => {
            if (typeof value !== 'number' || isNaN(value)) return message;
            return null;
        },
        min: (min: number) => (value: number, message = `Değer en az ${min} olmalı`): string | null => {
            if (value < min) return message;
            return null;
        },
        max: (max: number) => (value: number, message = `Değer en fazla ${max} olmalı`): string | null => {
            if (value > max) return message;
            return null;
        },
        integer: (value: number, message = 'Tam sayı olmalı'): string | null => {
            if (!Number.isInteger(value)) return message;
            return null;
        }
    },

    // Score validators (volleyball specific)
    score: {
        valid: (value: string, message = 'Geçerli bir skor girin (örn: 3-0, 3-1, 3-2, 2-3, 1-3, 0-3)'): string | null => {
            const validScores = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];
            if (!validScores.includes(value)) return message;
            return null;
        }
    }
};

// ============================================
// SCHEMA-BASED VALIDATION
// ============================================

type ValidatorFn = (value: unknown, message?: string) => string | null;

interface FieldSchema {
    validators: ValidatorFn[];
}

interface Schema {
    [field: string]: FieldSchema;
}

export function validate<T extends Record<string, unknown>>(
    data: T,
    schema: Schema
): ValidationResult<T> {
    const errors: string[] = [];

    for (const [field, fieldSchema] of Object.entries(schema)) {
        const value = data[field];

        for (const validator of fieldSchema.validators) {
            const error = validator(value);
            if (error) {
                errors.push(`${field}: ${error}`);
                break; // Stop on first error for this field
            }
        }
    }

    if (errors.length > 0) {
        return { success: false, errors };
    }

    return { success: true, data };
}

// ============================================
// COMMON SCHEMAS
// ============================================

export const schemas = {
    prediction: {
        score: {
            validators: [
                validators.string.required,
                validators.score.valid
            ]
        }
    },

    user: {
        email: {
            validators: [
                validators.string.required,
                validators.string.email
            ]
        },
        password: {
            validators: [
                validators.string.required,
                validators.string.minLength(6)
            ]
        },
        name: {
            validators: [
                validators.string.required,
                validators.string.minLength(2),
                validators.string.maxLength(50)
            ]
        }
    }
};

// ============================================
// SANITIZATION
// ============================================

export const sanitize = {
    // Remove HTML tags
    stripHtml: (input: string): string => {
        return input.replace(/<[^>]*>/g, '');
    },

    // Escape special characters
    escapeHtml: (input: string): string => {
        const escapeMap: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return input.replace(/[&<>"']/g, char => escapeMap[char]);
    },

    // Trim and normalize whitespace
    normalizeWhitespace: (input: string): string => {
        return input.trim().replace(/\s+/g, ' ');
    },

    // Remove non-alphanumeric characters
    alphanumericOnly: (input: string): string => {
        return input.replace(/[^a-zA-Z0-9\s]/g, '');
    },

    // Sanitize for safe display
    forDisplay: (input: string): string => {
        return sanitize.escapeHtml(sanitize.normalizeWhitespace(input));
    }
};

export default { validators, validate, schemas, sanitize };
