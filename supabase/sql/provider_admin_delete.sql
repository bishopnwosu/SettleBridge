-- =====================================================
-- SETTLEBRIDGE: LET ADMINS DELETE PROVIDER APPLICATIONS
-- Needed for the "Also delete their application" option,
-- for example when a provider asks you to delete their data (GDPR).
-- Only admins can delete. Safe to run more than once.
-- =====================================================

grant delete on public.provider_applications to authenticated;

drop policy if exists "Admins can delete provider applications" on public.provider_applications;
create policy "Admins can delete provider applications"
  on public.provider_applications for delete
  to authenticated
  using (public.is_settlebridge_admin());
