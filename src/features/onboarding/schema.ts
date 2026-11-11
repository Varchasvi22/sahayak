import { z } from 'zod';

export const onboardingSchema = z.object({
  // Step 2: Basic Information
  fullName: z
    .string()
    .min(2, { message: 'Please enter your name (at least 2 characters)' })
    .max(80, { message: 'Name must not exceed 80 characters' }),
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const now = new Date();
      return date < now && date.getFullYear() > 1900;
    }, { message: 'Please enter a valid past date of birth' }),
  age: z.coerce
    .number({ invalid_type_error: 'Please enter a valid age' })
    .int({ message: 'Age must be a whole number' })
    .min(1, { message: 'Age must be at least 1 year' })
    .max(120, { message: 'Please enter a realistic age' }),
  gender: z.enum(['FEMALE', 'MALE', 'TRANSGENDER', 'OTHER'], {
    required_error: 'Please select your gender',
  }),
  stateOfResidence: z.string().min(1, { message: 'Please select your State or Union Territory' }),
  district: z
    .string()
    .min(2, { message: 'Please enter your district (e.g. Varanasi, Bengaluru, Patna)' })
    .max(60),
  residenceArea: z.enum(['RURAL', 'URBAN', 'SEMI_URBAN'], {
    required_error: 'Please specify whether you live in a rural or urban area',
  }),

  // Step 3: Personal Circumstances
  educationLevel: z.enum(
    ['BELOW_10TH', 'CLASS_10_PASS', 'CLASS_12_PASS', 'DIPLOMA', 'GRADUATE', 'POST_GRADUATE', 'DOCTORATE'],
    { required_error: 'Please select your highest education level' }
  ),
  isStudent: z.boolean().default(false),
  employmentStatus: z.enum(
    [
      'STUDENT',
      'UNEMPLOYED',
      'SELF_EMPLOYED',
      'SALARIED_PRIVATE',
      'SALARIED_GOVERNMENT',
      'FARMER',
      'DAILY_WAGE_LABOUR',
      'HOMEMAKER',
      'RETIRED',
    ],
    { required_error: 'Please select your employment or vocational status' }
  ),
  annualFamilyIncome: z.coerce
    .number({ invalid_type_error: 'Please enter your estimated annual family income in Rupees' })
    .min(0, { message: 'Income cannot be negative' })
    .max(50000000, { message: 'Please enter a realistic annual income' }),
  beneficiaryCategories: z
    .array(z.string())
    .min(1, { message: 'Please select at least one primary beneficiary focus area' }),

  // Step 4: Additional Eligibility Information (Conditional)
  socialCategory: z.enum(['GENERAL', 'OBC', 'SC', 'ST', 'EWS'], {
    required_error: 'Please select your social category (used for statutory reservations)',
  }),
  hasBplCard: z.boolean().default(false),
  ownsAgriculturalLand: z.boolean().default(false),
  isDifferentlyAbled: z.boolean().default(false),
  disabilityPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  hasUdidCard: z.boolean().default(false),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const defaultOnboardingValues: OnboardingFormData = {
  fullName: '',
  dateOfBirth: '',
  age: 21,
  gender: 'FEMALE',
  stateOfResidence: 'Uttar Pradesh',
  district: '',
  residenceArea: 'URBAN',
  educationLevel: 'GRADUATE',
  isStudent: true,
  employmentStatus: 'STUDENT',
  annualFamilyIncome: 180000,
  beneficiaryCategories: ['STUDENTS'],
  socialCategory: 'SC',
  hasBplCard: false,
  ownsAgriculturalLand: false,
  isDifferentlyAbled: false,
  disabilityPercentage: null,
  hasUdidCard: false,
};
