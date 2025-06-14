import { Either, left, right } from 'fp-ts/lib/Either';

type ValidationRule = {
  type: 'string' | 'number' | 'boolean';
  required?: boolean;
};

export function validateField(
  value: any,
  rule: ValidationRule
): Either<string, any> {
  if (rule.required && (value === null || value === undefined || value === '')) {
    return left('This field is required');
  }

  if (rule.type === 'number' && isNaN(Number(value))) {
    return left('Must be a number');
  }
  return right(value);
}
