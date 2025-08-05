-- =============================================================================
-- ADD NOTIFICATION LOGS TABLE
-- =============================================================================
-- Tracks all notifications sent (SMS, email, etc) for audit and debugging
-- =============================================================================

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'push', 'in_app')),
    recipient TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_job_id ON public.notification_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type_status ON public.notification_logs(type, status);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Tradies can view notifications for their jobs
CREATE POLICY "tradies_view_own_notifications" 
ON public.notification_logs 
FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.jobs j
        WHERE j.id = notification_logs.job_id
        AND j.client_id = auth.uid()
    )
);

-- System can insert notifications
CREATE POLICY "system_insert_notifications" 
ON public.notification_logs 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- =============================================================================
-- ADD SMS TEMPLATE FOR JOB UPDATES
-- =============================================================================
-- Add a new template type for job updates if not already present
DO $$
BEGIN
    -- First check if the constraint exists and if 'job_update' is already included
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'tenant_sms_templates_template_type_check'
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%job_update%'
    ) THEN
        -- Drop the old constraint
        ALTER TABLE public.tenant_sms_templates 
        DROP CONSTRAINT IF EXISTS tenant_sms_templates_template_type_check;
        
        -- Add new constraint including 'job_update'
        ALTER TABLE public.tenant_sms_templates 
        ADD CONSTRAINT tenant_sms_templates_template_type_check 
        CHECK (template_type IN ('missed_call', 'after_hours', 'new_job', 'job_update', 'reminder'));
    END IF;
END $$;