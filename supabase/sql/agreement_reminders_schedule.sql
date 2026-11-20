-- =====================================================
-- SETTLEBRIDGE: RUN AGREEMENT REMINDERS AUTOMATICALLY EVERY DAY
-- Run this AFTER agreement_reminders_setup.sql, and after turning on
-- the pg_cron and pg_net extensions (Database > Extensions).
-- Safe to run more than once.
-- =====================================================

-- Remove an older copy of the job, if there is one
select cron.unschedule(jobid)
  from cron.job
 where jobname = 'agreement-reminders';

-- Every day at 09:15 UTC (09:15 in Lisbon in winter, 10:15 in summer)
select cron.schedule(
  'agreement-reminders',
  '15 9 * * *',
  $job$
    select net.http_post(
      url := 'https://jnvirsxymqdginyatyjq.supabase.co/functions/v1/provider-agreement',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-reminder-secret', (select value from private.app_secrets where name = 'agreement_reminder_secret')
      ),
      body := jsonb_build_object('action', 'auto-remind'),
      timeout_milliseconds := 60000
    );
  $job$
);

-- Check: this should show one row called "agreement-reminders"
select jobid, jobname, schedule, active from cron.job where jobname = 'agreement-reminders';
