-- =====================================================
-- SETTLEBRIDGE GUIDES: SEO AND SOCIAL SHARING FIELDS
-- Adds empty columns only. Safe to run more than once.
-- =====================================================

alter table public.blog_posts
  -- Title shown in Google (falls back to the guide title when empty)
  add column if not exists seo_title text
    check (seo_title is null or char_length(seo_title) <= 120),

  -- Text shown under the title in Google (falls back to the summary)
  add column if not exists meta_description text
    check (meta_description is null or char_length(meta_description) <= 320),

  -- The main search phrase this guide should rank for (used for the SEO score)
  add column if not exists focus_keyphrase text
    check (focus_keyphrase is null or char_length(focus_keyphrase) <= 100),

  -- What WhatsApp, Facebook and LinkedIn show when the guide is shared
  add column if not exists social_title text
    check (social_title is null or char_length(social_title) <= 120),

  add column if not exists social_description text
    check (social_description is null or char_length(social_description) <= 320),

  add column if not exists social_image_path text;
