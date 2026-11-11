/**
 * All 28 States and 8 Union Territories of India
 */
export const INDIAN_STATES_AND_UTS = [
  // 28 States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // 8 Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export const BENEFICIARY_CATEGORIES = [
  { value: 'STUDENTS', label: 'Students & Scholarships' },
  { value: 'FARMERS', label: 'Farmers & Agriculture' },
  { value: 'WOMEN', label: 'Women & Entrepreneurs' },
  { value: 'SENIOR_CITIZENS', label: 'Senior Citizens & Pensions' },
  { value: 'LOW_INCOME', label: 'Low-Income Households & Housing' },
  { value: 'PERSONS_WITH_DISABILITIES', label: 'Persons with Disabilities (Divyangjan)' },
  { value: 'EMPLOYMENT_SEEKERS', label: 'Unemployed & Skill Development' },
  { value: 'HEALTHCARE', label: 'Healthcare & Medical Assistance' },
] as const;

export const SOCIAL_CATEGORIES = [
  { value: 'GENERAL', label: 'General / Open' },
  { value: 'OBC', label: 'Other Backward Classes (OBC)' },
  { value: 'SC', label: 'Scheduled Castes (SC)' },
  { value: 'ST', label: 'Scheduled Tribes (ST)' },
  { value: 'EWS', label: 'Economically Weaker Sections (EWS)' },
] as const;

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'STUDENT', label: 'Student / Enrolled in Course' },
  { value: 'UNEMPLOYED', label: 'Unemployed Seeking Work' },
  { value: 'FARMER', label: 'Farmer / Cultivator' },
  { value: 'SELF_EMPLOYED', label: 'Self Employed / Micro-enterprise' },
  { value: 'DAILY_WAGE_LABOUR', label: 'Daily Wage / Informal Worker' },
  { value: 'HOMEMAKER', label: 'Homemaker' },
  { value: 'SALARIED_PRIVATE', label: 'Salaried (Private Sector)' },
  { value: 'SALARIED_GOVERNMENT', label: 'Salaried (Government / PSU)' },
  { value: 'RETIRED', label: 'Retired Senior Citizen' },
] as const;
