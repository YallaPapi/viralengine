/**
 * Validation result model
 */

/**
 * Result of validation operation
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  
  /** Validation errors */
  errors: ValidationIssue[];
  
  /** Validation warnings */
  warnings: ValidationWarning[];
  
  /** Additional validation metadata */
  metadata?: Record<string, any>;
}

/**
 * Validation issue found during validation
 */
export interface ValidationIssue {
  /** Error code */
  code: string;
  
  /** Error message */
  message: string;
  
  /** Field or property that failed */
  field?: string;
  
  /** Actual value that failed */
  value?: any;
  
  /** Expected value or constraint */
  expected?: any;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;
  
  /** Warning message */
  message: string;
  
  /** Field or property */
  field?: string;
  
  /** Suggestion for improvement */
  suggestion?: string;
}