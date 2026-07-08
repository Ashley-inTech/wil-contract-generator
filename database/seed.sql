USE wil_contract_db;

-- Insert Career Categories
INSERT INTO career_categories (career_name, role, responsibilities) VALUES
('Software Engineering', 'Software Engineer', 'Design, develop, and maintain software applications. Write clean, scalable code. Participate in code reviews and team meetings.'),
('Data Science', 'Data Scientist', 'Analyze complex data sets. Build machine learning models. Create data visualizations. Present findings to stakeholders.'),
('Database Management', 'Database Administrator', 'Manage and maintain database systems. Ensure data security and integrity. Optimize database performance. Perform backups and recovery.'),
('Systems Analysis', 'Systems Analyst', 'Analyze business requirements. Design system solutions. Coordinate with development teams. Document system specifications.'),
('HR Management', 'HR Officer', 'Manage employee records. Handle recruitment and onboarding. Maintain attendance and leave records. Coordinate HR activities.'),
('Digital Marketing', 'Digital Marketer', 'Create and manage digital marketing campaigns. Handle social media presence. Analyze marketing metrics. Create content and graphics.');

-- Insert Exposure Areas
INSERT INTO exposure_areas (career_id, exposure_name) VALUES
-- Software Engineering exposures
(1, 'Software Development'),
(1, 'Systems Analysis and Design'),
(1, 'Database Management'),
(1, 'Data Science and Machine Learning'),
(1, 'DevOps and Deployment'),
(1, 'Testing and Quality Assurance'),

-- Data Science exposures
(2, 'Data Analysis'),
(2, 'Machine Learning'),
(2, 'Statistical Modeling'),
(2, 'Data Visualization'),
(2, 'Big Data Technologies'),
(2, 'Python Programming'),

-- Database Management exposures
(3, 'Database Design'),
(3, 'SQL Programming'),
(3, 'Database Security'),
(3, 'Backup and Recovery'),
(3, 'Performance Tuning'),
(3, 'NoSQL Databases'),

-- Systems Analysis exposures
(4, 'Requirements Gathering'),
(4, 'System Design'),
(4, 'Documentation'),
(4, 'User Training'),
(4, 'Testing Methodologies'),
(4, 'Business Process Analysis'),

-- HR Management exposures
(5, 'Employee Record Management'),
(5, 'Recruitment and Onboarding'),
(5, 'Attendance Tracking'),
(5, 'HR Documentation'),
(5, 'Interview Coordination'),
(5, 'Performance Management'),

-- Digital Marketing exposures
(6, 'Social Media Management'),
(6, 'Content Creation'),
(6, 'Analytics and Reporting'),
(6, 'SEO and SEM'),
(6, 'Email Marketing'),
(6, 'Graphic Design');

-- Insert sample participants (to demonstrate the system)
INSERT INTO participants (
    first_name, 
    last_name, 
    id_number, 
    commencement_date, 
    termination_date, 
    career_id, 
    participant_role, 
    responsibilities,
    exposure_areas,
    signed_at,
    status
) VALUES (
    'Dipolelo Dalphy',
    'Kgole',
    '0406080323081',
    '2026-02-19',
    '2026-12-16',
    1, -- Software Engineering
    'Software Engineering Student',
    'Assisting with day-to-day administrative operations. Supporting HR department in maintaining employee records. Assisting with recruitment activities. Coordinating onboarding processes. Maintaining attendance records. Preparing reports and presentations. Participating in company meetings. General office management.',
    'Software Development, Database Management, Systems Analysis and Design, Data Science and Machine Learning',
    '2024-08-27',
    'Active'
),
(
    'Mphofela Sekopi',
    'Kevin',
    '90', -- This looks like it should be a full ID number but keeping as in original
    '2024-09-02',
    '2025-04-04',
    1,
    'WIL Student',
    'Software development tasks. Database management. Systems analysis. Data science and machine learning projects.',
    'Software Development, Database Management, Systems Analysis and Design, Data Science and Machine Learning',
    NULL,
    'Completed'
),
(
    'Sipho',
    'Nkosi',
    '8705261234089',
    '2025-01-15',
    '2025-07-15',
    2, -- Data Science
    'Data Science Intern',
    'Data cleaning and preprocessing. Building ML models. Creating reports and dashboards.',
    'Data Analysis, Machine Learning, Statistical Modeling, Data Visualization',
    '2025-01-20',
    'Active'
);

-- Insert sample contracts
INSERT INTO contracts (participant_id, generated_pdf, generated_docx, status) VALUES
(1, 'contract_1_2026.pdf', 'contract_1_2026.docx', 'Generated'),
(2, 'contract_2_2024.pdf', 'contract_2_2024.docx', 'Signed'),
(3, 'contract_3_2025.pdf', 'contract_3_2025.docx', 'Generated');

-- Insert sample WIL letters
INSERT INTO wil_letters (participant_id, generated_pdf, generated_docx, status) VALUES
(1, 'wil_letter_1_2026.pdf', 'wil_letter_1_2026.docx', 'Generated'),
(2, 'wil_letter_2_2024.pdf', 'wil_letter_2_2024.docx', 'Sent'),
(3, 'wil_letter_3_2025.pdf', 'wil_letter_3_2025.docx', 'Generated');

-- Some useful queries to test your setup

-- Query 1: Get all participants with their career info
-- SELECT p.*, c.career_name, c.role 
-- FROM participants p 
-- JOIN career_categories c ON p.career_id = c.career_id;

-- Query 2: Get exposure areas for a specific career
-- SELECT * FROM exposure_areas WHERE career_id = 1;

-- Query 3: Get participants with their contracts and WIL letters
-- SELECT 
--     p.first_name, 
--     p.last_name, 
--     p.id_number,
--     c.generated_pdf as contract_pdf,
--     w.generated_pdf as wil_pdf,
--     p.status
-- FROM participants p
-- LEFT JOIN contracts c ON p.participant_id = c.participant_id
-- LEFT JOIN wil_letters w ON p.participant_id = w.participant_id;

-- Query 4: Get active participants
-- SELECT * FROM participants WHERE status = 'Active';

-- Query 5: Get participants starting next month
-- SELECT * FROM participants 
-- WHERE commencement_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY);