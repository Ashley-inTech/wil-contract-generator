USE wil_contract_db;

-- Insert Career Categories
INSERT INTO career_categories (career_name, role, responsibilities) VALUES
('Software Engineering', 'Software Engineer', 'Design, develop, and maintain software applications. Write clean, scalable code. Participate in code reviews and team meetings.'),
('Data Science', 'Data Scientist', 'Analyze complex data sets. Build machine learning models. Create data visualizations. Present findings to stakeholders.'),
('Database Management', 'Database Administrator', 'Manage and maintain database systems. Ensure data security and integrity. Optimize database performance. Perform backups and recovery.'),
('Systems Analysis', 'Systems Analyst', 'Analyze business requirements. Design system solutions. Coordinate with development teams. Document system specifications.'),
('HR Management', 'HR Officer', 'Manage employee records. Handle recruitment and onboarding. Maintain attendance and leave records. Coordinate HR activities.'),
('Digital Marketing', 'Digital Marketer', 'Create and manage digital marketing campaigns. Handle social media presence. Analyze marketing metrics. Create content and graphics.'),
('Cybersecurity Analyst', 'Cybersecurity Analyst', 'Monitor networks. Investigate breaches.  Protect sensitive data. Conduct security testing.  Implement defense strategies.'),
('AI Engineer', 'AI Engineer', 'Develop machine learning models. Natural language processing systems, and AI-driven applications.'),
('Cloud Engineer', 'Cloud Engineer', 'Manage cloud infrastructure. Optimize performance. Ensure reliability. Implement DevOps practices.');


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
(6, 'Graphic Design'),

-- CyberSecurity Analyst
(7, 'Security Tester'),
(7, 'Networks Monitor'),

-- AI Engineer
(8, 'Machine Learning'),
(8, 'AI Machine Processing'),

-- Cloud Engineer
(9, 'Cloud Management'),
(9, 'DevOps Practice');

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
    'Tomm', 
    'Dalphy', 
    '0000043401235', 
    '2026-07-01', 
    '2026-07-31', 
    9, 
    'Cloud Engineer', 
    'Manage cloud infrastructure. Optimize performance. Ensure reliability. Implement DevOps practices.', 
    '• Cloud Management • DevOps Practice', 
    NULL, 
    'Active'
),
(
    'Dalphy', 
    'Bapela', 
    '0002100901235', 
    '2026-07-01', 
    '2026-09-30', 
    2, 
    'Data Scientist', 
    'Analyze complex data sets. Build machine learning models. Create data visualizations. Present findings to stakeholders.', 
    '• Big Data Technologies • Data Analysis • Data Visualization • Machine Learning • Python Programming • Statistical Modeling', 
    NULL,  
    'Active'
),
(
    'Ashley', 
    'Mia', 
    '0260000901235', 
    '2026-07-01', 
    '2026-10-31', 
    2, 
    'Data Scientist', 
    'Analyze complex data sets. Build machine learning models. Create data visualizations. Present findings to stakeholders.', 
    '• Big Data Technologies • Data Analysis • Data Visualization • Machine Learning • Python Programming • Statistical Modeling', 
    NULL,  
    'Active'
);