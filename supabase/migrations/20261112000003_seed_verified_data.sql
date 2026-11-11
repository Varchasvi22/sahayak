-- ==============================================================================
-- SAHAYAK - Migration 3: Seed Verified Real-World Indian Government Schemes
-- Description: Curated real data with official gazette URLs, rules, and document mappings
-- Target: PostgreSQL 15+ (Supabase)
-- ==============================================================================

-- 1. SEED SCHEME CATEGORIES
INSERT INTO public.scheme_categories (id, name, description, icon_name, display_order)
VALUES
    ('STUDENTS', 'Students & Scholarships', 'Pre-matric and post-matric financial assistance, tuition waivers, and educational fellowships.', 'GraduationCap', 1),
    ('FARMERS', 'Farmers & Agriculture', 'Direct income transfers, agricultural input subsidies, and crop insurance.', 'Tractor', 2),
    ('WOMEN', 'Women & Entrepreneurs', 'Small-savings schemes, maternity support grants, and self-help group micro-credit.', 'HeartHandshake', 3),
    ('SENIOR_CITIZENS', 'Senior Citizens & Pensions', 'Contributory and non-contributory retirement pensions for unorganized workers.', 'Users2', 4),
    ('LOW_INCOME', 'Low-Income Households', 'Affordable housing grants, NFSA subsidized grain support, and utility connections.', 'Home', 5),
    ('PERSONS_WITH_DISABILITIES', 'Divyangjan / Differently Abled', 'UDID-backed monthly pensions, assistive device distributions, and educational reservations.', 'Accessibility', 6),
    ('EMPLOYMENT_SEEKERS', 'Unemployed Youth & Skilling', 'Monthly unemployment allowances, apprentice stipends, and technical skill certifications.', 'Briefcase', 7),
    ('HEALTHCARE', 'Healthcare & Medical Assistance', 'Universal tertiary hospitalization cover and emergency medical grants.', 'HeartPulse', 8)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name,
    display_order = EXCLUDED.display_order;

-- 2. SEED SCHEMES
-- Scheme 1: PM-Kisan Samman Nidhi
INSERT INTO public.schemes (
    id, slug, official_name, short_title, description, benefits,
    financial_benefit_amount, government_level, applicable_region, category_id,
    department_name, official_application_url, official_portal_name, status,
    academic_or_financial_year, is_active, last_verified_at
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'pm-kisan-samman-nidhi',
    'Pradhan Mantri Kisan Samman Nidhi',
    'PM-Kisan',
    'Direct income support of ₹6,000 per year in three equal instalments of ₹2,000 directly into the bank accounts of landholding farmer families across India.',
    'Financial assistance of ₹6,000 per annum paid in 3 four-monthly instalments of ₹2,000 via Direct Benefit Transfer (DBT). Fully funded by Central Government.',
    6000.00,
    'CENTRAL',
    NULL,
    'FARMERS',
    'Ministry of Agriculture & Farmers Welfare',
    'https://pmkisan.gov.in',
    'pmkisan.gov.in',
    'ALWAYS_ACTIVE',
    'FY 2026-27',
    true,
    '2026-11-10'
) ON CONFLICT (slug) DO UPDATE SET
    official_name = EXCLUDED.official_name,
    benefits = EXCLUDED.benefits,
    last_verified_at = EXCLUDED.last_verified_at;

-- Scheme 2: Ayushman Bharat PM-JAY
INSERT INTO public.schemes (
    id, slug, official_name, short_title, description, benefits,
    financial_benefit_amount, government_level, applicable_region, category_id,
    department_name, official_application_url, official_portal_name, status,
    academic_or_financial_year, is_active, last_verified_at
) VALUES (
    'a0000000-0000-0000-0000-000000000002',
    'ayushman-bharat-pmjay',
    'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
    'Ayushman Bharat (PM-JAY)',
    'The world’s largest health insurance scheme providing health cover of ₹5,00,000 per family per year for secondary and tertiary care hospitalization.',
    'Cashless and paperless access to healthcare services in empanelled public and private hospitals across India. Covers pre-existing conditions from day one.',
    500000.00,
    'CENTRAL',
    NULL,
    'HEALTHCARE',
    'National Health Authority (NHA)',
    'https://pmjay.gov.in',
    'pmjay.gov.in',
    'ALWAYS_ACTIVE',
    'FY 2026-27',
    true,
    '2026-11-08'
) ON CONFLICT (slug) DO UPDATE SET
    official_name = EXCLUDED.official_name,
    benefits = EXCLUDED.benefits,
    last_verified_at = EXCLUDED.last_verified_at;

-- Scheme 3: Post Matric Scholarship for SC Students
INSERT INTO public.schemes (
    id, slug, official_name, short_title, description, benefits,
    financial_benefit_amount, government_level, applicable_region, category_id,
    department_name, official_application_url, official_portal_name, status,
    academic_or_financial_year, is_active, last_verified_at
) VALUES (
    'a0000000-0000-0000-0000-000000000003',
    'post-matric-scholarship-sc',
    'Post Matric Scholarship for Scheduled Caste Students',
    'Post-Matric Scholarship (SC)',
    'Centrally sponsored scheme providing 100% tuition fee reimbursement and monthly maintenance allowance for SC students pursuing Class 11, 12, degree, or professional studies.',
    'Full non-refundable compulsory fees reimbursed plus monthly maintenance allowance up to ₹1,200/month directly deposited to student account.',
    45000.00,
    'CENTRAL',
    NULL,
    'STUDENTS',
    'Ministry of Social Justice and Empowerment',
    'https://scholarships.gov.in',
    'scholarships.gov.in',
    'OPEN',
    'AY 2026-27',
    true,
    '2026-11-11'
) ON CONFLICT (slug) DO UPDATE SET
    official_name = EXCLUDED.official_name,
    benefits = EXCLUDED.benefits,
    last_verified_at = EXCLUDED.last_verified_at;

-- Scheme 4: Sukanya Samriddhi Yojana
INSERT INTO public.schemes (
    id, slug, official_name, short_title, description, benefits,
    financial_benefit_amount, government_level, applicable_region, category_id,
    department_name, official_application_url, official_portal_name, status,
    academic_or_financial_year, is_active, last_verified_at
) VALUES (
    'a0000000-0000-0000-0000-000000000004',
    'sukanya-samriddhi-yojana',
    'Sukanya Samriddhi Account Yojana (SSY)',
    'Sukanya Samriddhi Yojana',
    'Small deposit savings scheme for the girl child under Beti Bachao Beti Padhao campaign offering government-backed 8.2% tax-free interest and maturity benefits.',
    'Government sovereign guarantee, highest small-savings interest rate (8.2% p.a.), Section 80C tax deduction, tax-free interest and tax-free maturity amount.',
    150000.00,
    'CENTRAL',
    NULL,
    'WOMEN',
    'Ministry of Finance / India Post',
    'https://www.indiapost.gov.in',
    'indiapost.gov.in',
    'ALWAYS_ACTIVE',
    'FY 2026-27',
    true,
    '2026-11-05'
) ON CONFLICT (slug) DO UPDATE SET
    official_name = EXCLUDED.official_name,
    benefits = EXCLUDED.benefits,
    last_verified_at = EXCLUDED.last_verified_at;

-- Scheme 5: Karnataka Yuva Nidhi
INSERT INTO public.schemes (
    id, slug, official_name, short_title, description, benefits,
    financial_benefit_amount, government_level, applicable_region, category_id,
    department_name, official_application_url, official_portal_name, status,
    academic_or_financial_year, is_active, last_verified_at
) VALUES (
    'a0000000-0000-0000-0000-000000000005',
    'karnataka-yuva-nidhi-scheme',
    'Karnataka Yuva Nidhi Unemployment Allowance Scheme',
    'Yuva Nidhi (Karnataka)',
    'Monthly unemployment financial assistance of ₹3,000 for degree holders and ₹1,500 for diploma holders who graduated in Karnataka and have not secured employment.',
    'Monthly direct bank transfer: ₹3,000/month for Graduates; ₹1,500/month for Diploma holders for up to 24 months or until employment.',
    36000.00,
    'STATE',
    'Karnataka',
    'EMPLOYMENT_SEEKERS',
    'Department of Skill Development, Govt. of Karnataka',
    'https://sevasindhuservices.karnataka.gov.in',
    'sevasindhuservices.karnataka.gov.in',
    'OPEN',
    'AY 2026-27',
    true,
    '2026-11-09'
) ON CONFLICT (slug) DO UPDATE SET
    official_name = EXCLUDED.official_name,
    benefits = EXCLUDED.benefits,
    last_verified_at = EXCLUDED.last_verified_at;

-- Scheme 6: Atal Pension Yojana
INSERT INTO public.schemes (
    id, slug, official_name, short_title, description, benefits,
    financial_benefit_amount, government_level, applicable_region, category_id,
    department_name, official_application_url, official_portal_name, status,
    academic_or_financial_year, is_active, last_verified_at
) VALUES (
    'a0000000-0000-0000-0000-000000000006',
    'atal-pension-yojana',
    'Atal Pension Yojana (APY)',
    'Atal Pension Yojana',
    'Guaranteed monthly pension scheme of ₹1,000 to ₹5,000 for unorganized sector workers, starting at age 60 with government co-contribution.',
    'Guaranteed lifetime monthly pension from ₹1,000 up to ₹5,000 after 60 years of age. Same pension to spouse on death, and return of full corpus to nominee.',
    60000.00,
    'CENTRAL',
    NULL,
    'SENIOR_CITIZENS',
    'Pension Fund Regulatory and Development Authority (PFRDA)',
    'https://www.npscra.nsdl.co.in',
    'npscra.nsdl.co.in',
    'ALWAYS_ACTIVE',
    'FY 2026-27',
    true,
    '2026-11-07'
) ON CONFLICT (slug) DO UPDATE SET
    official_name = EXCLUDED.official_name,
    benefits = EXCLUDED.benefits,
    last_verified_at = EXCLUDED.last_verified_at;

-- 3. SEED ELIGIBILITY RULES
-- Rules for PM-Kisan
INSERT INTO public.eligibility_rules (scheme_id, field, operator, expected_value, rule_group, logical_relationship, label)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'owns_agricultural_land', 'EQUALS', 'true'::jsonb, 'default', 'AND', 'Applicant or family must own cultivable agricultural land'),
    ('a0000000-0000-0000-0000-000000000001', 'employment_status', 'NOT_EQUALS', '"SALARIED_GOVERNMENT"'::jsonb, 'default', 'AND', 'Must not be a serving or retired government / PSU employee'),
    ('a0000000-0000-0000-0000-000000000001', 'annual_family_income', 'LESS_THAN_OR_EQUAL', '1000000'::jsonb, 'default', 'AND', 'Must not be an income tax payer in previous assessment year');

-- Rules for Ayushman Bharat PM-JAY
INSERT INTO public.eligibility_rules (scheme_id, field, operator, expected_value, rule_group, logical_relationship, label)
VALUES
    ('a0000000-0000-0000-0000-000000000002', 'has_bpl_card', 'EQUALS', 'true'::jsonb, 'default', 'AND', 'Family must be identified under SECC 2011 or NFSA BPL ration category'),
    ('a0000000-0000-0000-0000-000000000002', 'annual_family_income', 'LESS_THAN_OR_EQUAL', '250000'::jsonb, 'default', 'AND', 'Annual family income must not exceed ₹2,50,000');

-- Rules for Post-Matric SC Scholarship
INSERT INTO public.eligibility_rules (scheme_id, field, operator, expected_value, rule_group, logical_relationship, label)
VALUES
    ('a0000000-0000-0000-0000-000000000003', 'social_category', 'EQUALS', '"SC"'::jsonb, 'default', 'AND', 'Applicant must belong to Scheduled Caste (SC) community'),
    ('a0000000-0000-0000-0000-000000000003', 'is_student', 'EQUALS', 'true'::jsonb, 'default', 'AND', 'Must be currently enrolled in post-matric recognized institution'),
    ('a0000000-0000-0000-0000-000000000003', 'annual_family_income', 'LESS_THAN_OR_EQUAL', '250000'::jsonb, 'default', 'AND', 'Total family income from all sources must not exceed ₹2,50,000/year');

-- Rules for Sukanya Samriddhi
INSERT INTO public.eligibility_rules (scheme_id, field, operator, expected_value, rule_group, logical_relationship, label)
VALUES
    ('a0000000-0000-0000-0000-000000000004', 'gender', 'EQUALS', '"FEMALE"'::jsonb, 'default', 'AND', 'Beneficiary must be a female child'),
    ('a0000000-0000-0000-0000-000000000004', 'age', 'LESS_THAN_OR_EQUAL', '10'::jsonb, 'default', 'AND', 'Account can only be opened before girl child reaches 10 years of age');

-- Rules for Karnataka Yuva Nidhi
INSERT INTO public.eligibility_rules (scheme_id, field, operator, expected_value, rule_group, logical_relationship, label)
VALUES
    ('a0000000-0000-0000-0000-000000000005', 'state_of_residence', 'EQUALS', '"Karnataka"'::jsonb, 'default', 'AND', 'Must be a permanent resident / domicile of Karnataka'),
    ('a0000000-0000-0000-0000-000000000005', 'employment_status', 'EQUALS', '"UNEMPLOYED"'::jsonb, 'default', 'AND', 'Must be currently unemployed after completion of degree / diploma'),
    ('a0000000-0000-0000-0000-000000000005', 'education_level', 'IN', '["GRADUATE", "DIPLOMA", "POST_GRADUATE"]'::jsonb, 'default', 'AND', 'Must hold a recognized Diploma or Bachelor / Post Graduate Degree');

-- Rules for Atal Pension Yojana
INSERT INTO public.eligibility_rules (scheme_id, field, operator, expected_value, rule_group, logical_relationship, label)
VALUES
    ('a0000000-0000-0000-0000-000000000006', 'age', 'BETWEEN', '[18, 40]'::jsonb, 'default', 'AND', 'Entry age must be between 18 and 40 years'),
    ('a0000000-0000-0000-0000-000000000006', 'employment_status', 'NOT_EQUALS', '"SALARIED_GOVERNMENT"'::jsonb, 'default', 'AND', 'Must not be covered under any statutory social security scheme');

-- 4. SEED SCHEME DOCUMENTS
INSERT INTO public.scheme_documents (scheme_id, canonical_key, document_name, is_mandatory, issuing_authority, validity_period, how_to_obtain_url, approx_days_to_issue)
VALUES
    -- PM-Kisan Docs
    ('a0000000-0000-0000-0000-000000000001', 'doc_bank_passbook', 'Aadhaar-Seeded Bank Passbook', true, 'Commercial Bank / Post Office', 'Active Account', 'https://www.npci.org.in', 1),
    ('a0000000-0000-0000-0000-000000000001', 'doc_land_record', 'Land Record (RoR / 7/12 / Patta)', true, 'Revenue Department / Bhulekh', 'Current Season', 'https://dilrmp.gov.in', 3),

    -- Ayushman Bharat Docs
    ('a0000000-0000-0000-0000-000000000002', 'doc_ration_card', 'Ration Card (NFSA / BPL / AAY)', true, 'Food & Civil Supplies Dept', 'Perpetual', 'https://nfsa.gov.in', 30),
    ('a0000000-0000-0000-0000-000000000002', 'doc_voter_id', 'Voter ID (EPIC) or Photo Identity', true, 'Election Commission of India', 'Permanent', 'https://voters.eci.gov.in', 20),

    -- Post-Matric SC Docs
    ('a0000000-0000-0000-0000-000000000003', 'doc_caste_cert', 'Caste Certificate (SC)', true, 'Sub-Divisional Officer / Tehsildar', 'Lifetime', 'https://services.india.gov.in', 21),
    ('a0000000-0000-0000-0000-000000000003', 'doc_income_cert', 'Income Certificate', true, 'Revenue Department / Tehsildar', '1 Financial Year', 'https://services.india.gov.in', 14),
    ('a0000000-0000-0000-0000-000000000003', 'doc_marksheet_10', 'Class 10 Passing Certificate', true, 'State / Central Board', 'Permanent', 'https://digilocker.gov.in', 0),
    ('a0000000-0000-0000-0000-000000000003', 'doc_college_id', 'Current College Bonafide & Fee Receipt', true, 'College Administration', 'Current Academic Term', NULL, 2),
    ('a0000000-0000-0000-0000-000000000003', 'doc_bank_passbook', 'Aadhaar-Seeded Bank Passbook', true, 'Commercial Bank / Post Office', 'Active Account', 'https://www.npci.org.in', 1)
ON CONFLICT (scheme_id, canonical_key) DO NOTHING;

-- 5. SEED SCHEME SOURCES
INSERT INTO public.scheme_sources (scheme_id, official_source_url, source_type, last_checked_date, notes)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'https://pmkisan.gov.in/Documents/RevisedGuidelines.pdf', 'GUIDELINES_PDF', '2026-11-10', 'Operational guidelines for PM-Kisan DBT transfer'),
    ('a0000000-0000-0000-0000-000000000002', 'https://nha.gov.in/PM-JAY', 'MINISTRY_PORTAL', '2026-11-08', 'National Health Authority official hospital empanelment criteria'),
    ('a0000000-0000-0000-0000-000000000003', 'https://socialjustice.gov.in/schemes/post-matric-scholarship-sc', 'GAZETTE', '2026-11-11', 'Ministry of Social Justice post-matric scholarship central assistance notification');
