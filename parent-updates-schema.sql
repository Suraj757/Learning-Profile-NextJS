-- Parent Updates System Schema
-- This extends the existing database with parent communication features

-- Parent Updates table - Core update system
CREATE TABLE IF NOT EXISTS parent_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    assignment_id INTEGER REFERENCES profile_assignments(id) ON DELETE SET NULL,
    
    -- Update content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    update_type VARCHAR(20) DEFAULT 'day3' CHECK (update_type IN ('day3', 'week1', 'custom')),
    learning_style_focus TEXT, -- Which aspect of the profile was used
    success_story TEXT, -- Specific example of profile application
    
    -- Scheduling and delivery
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'draft' CHECK (delivery_status IN ('draft', 'scheduled', 'sent', 'delivered', 'failed')),
    
    -- Access control
    parent_access_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_updates_teacher_id ON parent_updates(teacher_id);
CREATE INDEX IF NOT EXISTS idx_parent_updates_student_id ON parent_updates(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_updates_token ON parent_updates(parent_access_token);
CREATE INDEX IF NOT EXISTS idx_parent_updates_scheduled ON parent_updates(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_parent_updates_sent ON parent_updates(sent_at);

-- Photo attachments for updates
CREATE TABLE IF NOT EXISTS update_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    update_id UUID REFERENCES parent_updates(id) ON DELETE CASCADE,
    
    -- File details
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Storage path (e.g., /uploads/teacher_123/update_456/photo_1.jpg)
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    
    -- Photo metadata
    caption TEXT,
    alt_text TEXT, -- For accessibility
    display_order INTEGER DEFAULT 0,
    
    -- Privacy and permissions
    parent_permission_granted BOOLEAN DEFAULT false,
    permission_requested_at TIMESTAMP WITH TIME ZONE,
    permission_granted_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_update_photos_update_id ON update_photos(update_id);
CREATE INDEX IF NOT EXISTS idx_update_photos_order ON update_photos(update_id, display_order);

-- Parent responses to updates
CREATE TABLE IF NOT EXISTS parent_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    update_id UUID REFERENCES parent_updates(id) ON DELETE CASCADE,
    
    -- Response content
    response_text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- How well does this match home behavior?
    helpful_rating INTEGER CHECK (helpful_rating >= 1 AND helpful_rating <= 5), -- How helpful was this update?
    
    -- Additional feedback
    home_observations TEXT, -- "Here's what I see at home..."
    questions_for_teacher TEXT, -- Follow-up questions
    photo_permission_response BOOLEAN, -- Response to photo permission request
    
    -- Tracking
    parent_email TEXT NOT NULL,
    response_ip TEXT, -- For basic spam prevention
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_responses_update_id ON parent_responses(update_id);
CREATE INDEX IF NOT EXISTS idx_parent_responses_parent_email ON parent_responses(parent_email);

-- Update templates for quick composition
CREATE TABLE IF NOT EXISTS update_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    
    -- Template details
    name TEXT NOT NULL,
    title_template TEXT NOT NULL, -- "Here's how I'm using {child_name}'s profile"
    message_template TEXT NOT NULL, -- Template with {placeholders}
    update_type VARCHAR(20) DEFAULT 'custom' CHECK (update_type IN ('day3', 'week1', 'custom')),
    learning_style VARCHAR(50), -- Which learning style this template targets
    
    -- Usage tracking
    is_default BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_update_templates_teacher_id ON update_templates(teacher_id);
CREATE INDEX IF NOT EXISTS idx_update_templates_type ON update_templates(update_type);

-- Teacher update analytics and tracking
CREATE TABLE IF NOT EXISTS update_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
    update_id UUID REFERENCES parent_updates(id) ON DELETE CASCADE,
    
    -- Engagement metrics
    parent_email_opened BOOLEAN DEFAULT false,
    parent_clicked_link BOOLEAN DEFAULT false,
    parent_viewed_photos BOOLEAN DEFAULT false,
    parent_responded BOOLEAN DEFAULT false,
    
    -- Timing analytics
    email_opened_at TIMESTAMP WITH TIME ZONE,
    first_click_at TIMESTAMP WITH TIME ZONE,
    response_submitted_at TIMESTAMP WITH TIME ZONE,
    
    -- Response quality metrics
    response_length INTEGER, -- Character count of response
    parent_satisfaction_score INTEGER, -- From response rating
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_update_analytics_teacher_id ON update_analytics(teacher_id);
CREATE INDEX IF NOT EXISTS idx_update_analytics_update_id ON update_analytics(update_id);

-- Email delivery tracking
CREATE TABLE IF NOT EXISTS email_deliveries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    update_id UUID REFERENCES parent_updates(id) ON DELETE CASCADE,
    
    -- Delivery details
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    email_provider VARCHAR(50), -- 'sendgrid', 'ses', 'resend', etc.
    provider_message_id TEXT, -- External tracking ID
    
    -- Status tracking
    delivery_status VARCHAR(20) DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
    bounce_reason TEXT,
    error_message TEXT,
    
    -- Engagement tracking
    opened_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    last_opened_at TIMESTAMP WITH TIME ZONE,
    last_clicked_at TIMESTAMP WITH TIME ZONE,
    
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_email_deliveries_update_id ON email_deliveries(update_id);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_recipient ON email_deliveries(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_status ON email_deliveries(delivery_status);

-- RLS Policies for the new tables
ALTER TABLE parent_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_deliveries ENABLE ROW LEVEL SECURITY;

-- Parent Updates policies
CREATE POLICY "Teachers can manage their own updates" ON parent_updates
    FOR ALL USING (teacher_id IN (SELECT id FROM teachers));

CREATE POLICY "Parents can view updates with valid token" ON parent_updates
    FOR SELECT USING (
        parent_access_token IS NOT NULL 
        AND expires_at > NOW()
    );

-- Update Photos policies
CREATE POLICY "Teachers can manage photos for their updates" ON update_photos
    FOR ALL USING (
        update_id IN (
            SELECT id FROM parent_updates 
            WHERE teacher_id IN (SELECT id FROM teachers)
        )
    );

CREATE POLICY "Parents can view photos for accessible updates" ON update_photos
    FOR SELECT USING (
        update_id IN (
            SELECT id FROM parent_updates 
            WHERE parent_access_token IS NOT NULL 
            AND expires_at > NOW()
        )
    );

-- Parent Responses policies
CREATE POLICY "Anyone can submit parent responses" ON parent_responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Teachers can view responses to their updates" ON parent_responses
    FOR SELECT USING (
        update_id IN (
            SELECT id FROM parent_updates 
            WHERE teacher_id IN (SELECT id FROM teachers)
        )
    );

-- Update Templates policies
CREATE POLICY "Teachers can manage their own templates" ON update_templates
    FOR ALL USING (teacher_id IN (SELECT id FROM teachers));

-- Analytics policies (teacher access only)
CREATE POLICY "Teachers can view their own analytics" ON update_analytics
    FOR ALL USING (teacher_id IN (SELECT id FROM teachers));

CREATE POLICY "Teachers can view their email delivery stats" ON email_deliveries
    FOR ALL USING (
        update_id IN (
            SELECT id FROM parent_updates 
            WHERE teacher_id IN (SELECT id FROM teachers)
        )
    );

-- Update triggers for updated_at fields
CREATE TRIGGER update_parent_updates_updated_at 
    BEFORE UPDATE ON parent_updates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_update_templates_updated_at 
    BEFORE UPDATE ON update_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Default templates for new teachers
INSERT INTO update_templates (name, title_template, message_template, update_type, learning_style, is_default) VALUES
('Day 3 Visual Learner Success', 
 'Amazing progress using {child_name}''s visual learning style!', 
 'Hi! I wanted to share some exciting news about {child_name}. Based on their learning profile showing strong visual preferences, I tried using more diagrams and visual aids in today''s {subject} lesson. {child_name} lit up and was so much more engaged! I could see them making connections in a way that really clicked. This is exactly why those learning profiles are so valuable - they help me reach each child in their unique way. How does this match what you see when {child_name} learns at home?',
 'day3', 'visual', true),

('Day 3 Kinesthetic Learner Success', 
 '{child_name} thrived with hands-on learning today!', 
 'What a difference! Today I incorporated more movement and hands-on activities based on {child_name}''s kinesthetic learning profile. During our {subject} lesson, instead of just sitting and listening, {child_name} got to manipulate materials and move around. The change was incredible - much more focused and excited about learning! I''m so glad we have this insight into how {child_name} learns best. Do you notice {child_name} learns better when they can move and touch things at home too?',
 'day3', 'kinesthetic', true),

('Day 3 Auditory Learner Success', 
 '{child_name} responded beautifully to our discussion-based approach!', 
 'I have wonderful news to share! Knowing that {child_name} is an auditory learner, I made sure to include more verbal explanations and group discussions in today''s {subject} lesson. {child_name} was so engaged and had great insights to share! It''s clear that hearing information and talking through ideas really helps {child_name} process and understand. This profile information is invaluable for helping me teach in the way each child learns best. Does {child_name} like to talk through problems and ideas at home too?',
 'day3', 'auditory', true),

('Week 1 Learning Style Integration', 
 'How {child_name}''s learning style is shaping our classroom approach', 
 'After a full week of applying {child_name}''s learning profile insights, I wanted to update you on the wonderful progress I''m seeing. By focusing on {child_name}''s {learning_style} preferences, I''ve been able to create more opportunities for success in {subject_areas}. The difference in engagement and confidence is remarkable! {child_name} seems more comfortable participating and is showing real growth. I''m excited to continue building on this foundation. What learning activities does {child_name} enjoy most at home?',
 'week1', 'general', true);

-- Function to generate parent access tokens
CREATE OR REPLACE FUNCTION generate_parent_access_token()
RETURNS TEXT AS $$
BEGIN
    RETURN 'parent_' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to auto-schedule Day 3 updates when assignments are completed
CREATE OR REPLACE FUNCTION schedule_day3_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger when assignment status changes to 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Insert a scheduled Day 3 update
        INSERT INTO parent_updates (
            teacher_id, 
            assignment_id,
            title,
            message,
            update_type,
            scheduled_for,
            parent_access_token,
            delivery_status
        ) VALUES (
            NEW.teacher_id,
            NEW.id,
            'Day 3 Update: Using ' || NEW.child_name || '''s learning profile',
            'This is an automated reminder to send your Day 3 parent update showing how you''re using ' || NEW.child_name || '''s learning profile.',
            'day3',
            NOW() + INTERVAL '3 days',
            generate_parent_access_token(),
            'scheduled'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-schedule updates
CREATE TRIGGER auto_schedule_day3_update
    AFTER UPDATE ON profile_assignments
    FOR EACH ROW
    EXECUTE FUNCTION schedule_day3_update();

-- Views for teacher dashboard analytics
CREATE VIEW teacher_update_stats AS
SELECT 
    t.id as teacher_id,
    t.name as teacher_name,
    COUNT(pu.id) as total_updates_sent,
    COUNT(CASE WHEN pu.delivery_status = 'sent' THEN 1 END) as updates_delivered,
    COUNT(pr.id) as parent_responses_received,
    ROUND(AVG(pr.helpful_rating), 2) as avg_helpfulness_rating,
    COUNT(CASE WHEN pr.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as responses_this_week
FROM teachers t
LEFT JOIN parent_updates pu ON t.id = pu.teacher_id
LEFT JOIN parent_responses pr ON pu.id = pr.update_id
GROUP BY t.id, t.name;

-- View for parent engagement metrics
CREATE VIEW parent_engagement_stats AS
SELECT 
    pu.teacher_id,
    pa.parent_email,
    pa.child_name,
    COUNT(pu.id) as updates_received,
    COUNT(pr.id) as responses_submitted,
    MAX(pr.created_at) as last_response_date,
    ROUND(AVG(pr.helpful_rating), 2) as avg_satisfaction_rating
FROM parent_updates pu
JOIN profile_assignments pa ON pu.assignment_id = pa.id
LEFT JOIN parent_responses pr ON pu.id = pr.update_id
WHERE pu.delivery_status = 'sent'
GROUP BY pu.teacher_id, pa.parent_email, pa.child_name;