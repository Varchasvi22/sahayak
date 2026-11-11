export type Gender = 'MALE' | 'FEMALE' | 'TRANSGENDER' | 'OTHER';

export type ResidenceArea = 'RURAL' | 'URBAN' | 'SEMI_URBAN';

export type SocialCategory = 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS';

export type EmploymentStatus =
  | 'STUDENT'
  | 'UNEMPLOYED'
  | 'SELF_EMPLOYED'
  | 'SALARIED_PRIVATE'
  | 'SALARIED_GOVERNMENT'
  | 'FARMER'
  | 'DAILY_WAGE_LABOUR'
  | 'HOMEMAKER'
  | 'RETIRED';

export type EducationLevel =
  | 'BELOW_10TH'
  | 'CLASS_10_PASS'
  | 'CLASS_12_PASS'
  | 'DIPLOMA'
  | 'GRADUATE'
  | 'POST_GRADUATE'
  | 'DOCTORATE';

export type RationCardType = 'NONE' | 'APL' | 'BPL' | 'AAY_ANANTYODAYA';

export interface ApplicantProfile {
  id?: string;
  user_id?: string;
  full_name?: string;
  date_of_birth?: string; // YYYY-MM-DD
  age?: number;
  gender?: Gender;
  state_of_residence?: string;
  district?: string;
  residence_area?: ResidenceArea;
  annual_family_income?: number;
  social_category?: SocialCategory;
  employment_status?: EmploymentStatus;
  occupation?: string;
  education_level?: EducationLevel;
  is_student?: boolean;
  is_differently_abled?: boolean;
  disability_percentage?: number;
  has_bpl_card?: boolean;
  ration_card_type?: RationCardType;
  owns_agricultural_land?: boolean;
  is_street_vendor?: boolean;
  created_at?: string;
  updated_at?: string;
}
