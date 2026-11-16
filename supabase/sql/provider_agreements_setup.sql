-- =====================================================
-- SETTLEBRIDGE: PROVIDER AGREEMENTS AND ELECTRONIC SIGNATURES
-- Safe to run more than once.
-- =====================================================


-- 1. AGREEMENT TEXT (one row per version and language)
-- The text is public (anyone may read an agreement); only admins can change it.
create table if not exists public.agreement_versions (
  version text not null,
  language text not null check (language in ('en', 'pt')),
  content jsonb not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (version, language)
);

alter table public.agreement_versions enable row level security;

grant select on public.agreement_versions to anon, authenticated;
grant insert, update, delete on public.agreement_versions to authenticated;

drop policy if exists "Anyone can read agreement text" on public.agreement_versions;
create policy "Anyone can read agreement text"
  on public.agreement_versions for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins can manage agreement text" on public.agreement_versions;
create policy "Admins can manage agreement text"
  on public.agreement_versions for all
  to authenticated
  using (public.is_settlebridge_admin())
  with check (public.is_settlebridge_admin());

-- Version 2026-11-v1 (DRAFT FOR LEGAL REVIEW), English and Portuguese
insert into public.agreement_versions (version, language, content, is_current)
values
  ('2026-11-v1', 'en', $en${"title": "Provider Agreement", "intro": "This agreement sets out how you, as an approved service provider, work with SettleBridge. Please read it carefully. By signing, you agree to these terms.", "labels": {"reference": "Reference", "version": "Version", "draft": "DRAFT FOR LEGAL REVIEW - not yet approved by a lawyer.", "provider": "Provider", "representedBy": "Represented by", "email": "Email", "category": "Service category", "location": "Location", "approvedOn": "Approved on", "signatures": "Signatures", "forProvider": "For the Provider", "forSettleBridge": "For SettleBridge", "signedBy": "Signed electronically by", "dateTime": "Date and time", "ip": "IP address", "emailConfirmed": "Email", "notSigned": "Not yet signed", "signHint": "Sign online using the link in your approval email.", "approvedBy": "Approved electronically by SettleBridge", "date": "Date", "signatory": "[INSERT NAME AND ROLE OF SIGNATORY]", "page": "Page", "of": "of", "notProvided": "Not provided"}, "sections": [{"heading": "1. Who this agreement is between", "paragraphs": ["SettleBridge, [INSERT REGISTERED BUSINESS NAME], [INSERT REGISTERED ADDRESS] (\"SettleBridge\", \"we\", \"us\").", "{businessName}, represented by {contactName} (\"the Provider\", \"you\")."]}, {"heading": "2. What SettleBridge does", "paragraphs": ["SettleBridge is an online marketplace that helps newcomers to Portugal find local services. We list your services, receive requests from newcomers and pass those requests to you.", "SettleBridge is not your employer, agent or business partner, and does not provide the services itself. Any agreement to provide a service is made directly between you and the customer."]}, {"heading": "3. Your public profile", "bullets": ["We publish a profile showing your business name, service category, location, service area, description, languages and pricing.", "Your email address, phone and WhatsApp numbers are never shown publicly.", "You must keep your information accurate and tell us promptly about any changes.", "We may edit your profile for clarity or accuracy, and we may hide it while we check a concern."]}, {"heading": "4. Service requests", "bullets": ["When a newcomer asks for your service, we send you their request and contact details.", "Please reply within [2 WORKING DAYS] to say whether you can help. You are free to accept or decline any request.", "Prices, dates and terms of each service are agreed between you and the customer."]}, {"heading": "5. Your responsibilities", "bullets": ["Provide your services honestly, safely, with reasonable skill and care, and at the price you advertise or agree.", "Hold any licences, registrations and insurance your services legally require.", "You are an independent business and are responsible for your own taxes, social security and legal obligations.", "Treat every customer with respect and never discriminate on any ground protected by law."]}, {"heading": "6. Fees", "paragraphs": ["[INSERT FEES, FOR EXAMPLE: \"Listing on SettleBridge is free during the launch period. We will give you at least 30 days' notice by email before introducing any fee.\"]"]}, {"heading": "7. Customers' personal data", "bullets": ["Use customers' details only to respond to and deliver the service they requested.", "Do not send them marketing, or share their details with anyone else, without their permission.", "Keep their information secure and delete it when you no longer need it.", "Tell us without delay if customer information you received from us is lost or misused.", "Once you receive a customer's details, you are responsible for how you use them under data protection law (GDPR)."]}, {"heading": "8. Suspension and ending this agreement", "bullets": ["You can end this agreement at any time by emailing us. We will then remove your profile.", "We can end it by giving you [14 DAYS'] notice by email.", "We may hide or remove your profile immediately if you seriously break this agreement, if we receive serious complaints, or if the law requires it."]}, {"heading": "9. Liability", "paragraphs": ["[TO BE COMPLETED WITH YOUR LAWYER. Usually this explains that SettleBridge is not responsible for services provided by you, and limits each party's liability as far as the law allows.]"]}, {"heading": "10. Changes to this agreement", "paragraphs": ["We may update this agreement. We will email you the new version at least 30 days before it takes effect. If you do not agree, you can end this agreement before then."]}, {"heading": "11. Law, language and signature", "bullets": ["This agreement is governed by Portuguese law. [CONFIRM COURTS, FOR EXAMPLE: the courts of Lisbon].", "If this agreement is translated, the English version takes priority.", "You agree that signing electronically has the same effect as signing on paper."]}]}$en$::jsonb, true),
  ('2026-11-v1', 'pt', $pt${"title": "Acordo de Prestador", "intro": "Este acordo define como trabalha com a SettleBridge enquanto prestador de serviços aprovado. Leia-o com atenção. Ao assinar, aceita estes termos. Esta tradução é fornecida para sua conveniência; em caso de diferença, prevalece a versão em inglês.", "labels": {"reference": "Referência", "version": "Versão", "draft": "RASCUNHO PARA REVISÃO JURÍDICA - ainda não aprovado por um advogado.", "provider": "Prestador", "representedBy": "Representado por", "email": "Email", "category": "Categoria de serviço", "location": "Localização", "approvedOn": "Aprovado em", "signatures": "Assinaturas", "forProvider": "Pelo Prestador", "forSettleBridge": "Pela SettleBridge", "signedBy": "Assinado eletronicamente por", "dateTime": "Data e hora", "ip": "Endereço IP", "emailConfirmed": "Email", "notSigned": "Ainda não assinado", "signHint": "Assine online através da ligação no seu email de aprovação.", "approvedBy": "Aprovado eletronicamente pela SettleBridge", "date": "Data", "signatory": "[INSERIR NOME E CARGO DO SIGNATÁRIO]", "page": "Página", "of": "de", "notProvided": "Não indicado"}, "sections": [{"heading": "1. Partes deste acordo", "paragraphs": ["SettleBridge, [INSERIR DENOMINAÇÃO SOCIAL], [INSERIR MORADA DA SEDE] (\"SettleBridge\", \"nós\").", "{businessName}, representado por {contactName} (\"o Prestador\", \"você\")."]}, {"heading": "2. O que faz a SettleBridge", "paragraphs": ["A SettleBridge é um mercado online que ajuda os recém-chegados a Portugal a encontrar serviços locais. Publicamos os seus serviços, recebemos pedidos de recém-chegados e encaminhamos esses pedidos para si.", "A SettleBridge não é sua entidade empregadora, agente ou sócia, e não presta os serviços. Qualquer acordo para prestar um serviço é celebrado diretamente entre si e o cliente."]}, {"heading": "3. O seu perfil público", "bullets": ["Publicamos um perfil com o nome da sua empresa, categoria de serviço, localização, área de atuação, descrição, idiomas e preços.", "O seu email e os seus números de telefone e WhatsApp nunca são mostrados publicamente.", "Deve manter a sua informação correta e informar-nos rapidamente de quaisquer alterações.", "Podemos editar o seu perfil por razões de clareza ou exatidão, e ocultá-lo enquanto analisamos uma preocupação."]}, {"heading": "4. Pedidos de serviço", "bullets": ["Quando um recém-chegado pede o seu serviço, enviamos-lhe o pedido e os respetivos contactos.", "Responda no prazo de [2 DIAS ÚTEIS] a indicar se pode ajudar. É livre de aceitar ou recusar qualquer pedido.", "Os preços, datas e condições de cada serviço são acordados entre si e o cliente."]}, {"heading": "5. As suas responsabilidades", "bullets": ["Prestar os seus serviços com honestidade, segurança, competência e cuidado razoáveis, e pelo preço anunciado ou acordado.", "Ter as licenças, registos e seguros legalmente exigidos para os seus serviços.", "É uma empresa independente e é responsável pelos seus próprios impostos, segurança social e obrigações legais.", "Tratar todos os clientes com respeito e nunca discriminar por qualquer motivo protegido por lei."]}, {"heading": "6. Taxas", "paragraphs": ["[INSERIR TAXAS, POR EXEMPLO: \"A presença na SettleBridge é gratuita durante o período de lançamento. Avisaremos por email com pelo menos 30 dias de antecedência antes de introduzir qualquer taxa.\"]"]}, {"heading": "7. Dados pessoais dos clientes", "bullets": ["Utilize os dados dos clientes apenas para responder ao pedido e prestar o serviço solicitado.", "Não lhes envie marketing nem partilhe os seus dados com terceiros sem autorização.", "Mantenha a informação segura e apague-a quando já não for necessária.", "Informe-nos sem demora se informação de clientes recebida através de nós for perdida ou usada indevidamente.", "A partir do momento em que recebe os dados de um cliente, é responsável pela forma como os utiliza nos termos da lei de proteção de dados (RGPD)."]}, {"heading": "8. Suspensão e cessação do acordo", "bullets": ["Pode terminar este acordo a qualquer momento por email. Nesse caso, removeremos o seu perfil.", "Podemos terminá-lo com um aviso prévio de [14 DIAS] por email.", "Podemos ocultar ou remover o seu perfil de imediato em caso de violação grave deste acordo, de reclamações graves ou se a lei o exigir."]}, {"heading": "9. Responsabilidade", "paragraphs": ["[A COMPLETAR COM O SEU ADVOGADO. Normalmente esclarece que a SettleBridge não é responsável pelos serviços prestados por si e limita a responsabilidade de cada parte na medida permitida por lei.]"]}, {"heading": "10. Alterações a este acordo", "paragraphs": ["Podemos atualizar este acordo. Enviar-lhe-emos a nova versão por email pelo menos 30 dias antes de entrar em vigor. Se não concordar, pode terminar o acordo antes dessa data."]}, {"heading": "11. Lei, idioma e assinatura", "bullets": ["Este acordo rege-se pela lei portuguesa. [CONFIRMAR TRIBUNAIS, POR EXEMPLO: os tribunais de Lisboa].", "Se este acordo for traduzido, prevalece a versão em inglês.", "Aceita que a assinatura eletrónica tem o mesmo efeito que a assinatura em papel."]}]}$pt$::jsonb, true)
on conflict (version, language) do update
  set content = excluded.content,
      is_current = excluded.is_current;


-- 2. ONE AGREEMENT PER APPROVAL
-- Provider details are copied in ("snapshot"), so the record stays accurate
-- even if the profile is edited later. The signing link is stored only as a
-- hash, so even someone who could read this table could not use the links.
create table if not exists public.provider_agreements (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  application_id uuid references public.provider_applications (id) on delete set null,
  provider_id uuid references public.providers (id) on delete set null,
  version text not null,
  business_name text not null,
  contact_name text,
  email text not null,
  category_name text,
  location text,
  approved_on date not null default current_date,
  token_hash text not null unique,
  token_expires_at timestamptz not null default (now() + interval '30 days'),
  status text not null default 'sent'
    check (status in ('sent', 'signed', 'void')),
  sent_at timestamptz not null default now(),
  email_sent_at timestamptz,
  email_error text,
  signed_at timestamptz,
  signed_language text check (signed_language is null or signed_language in ('en', 'pt')),
  signer_name text check (signer_name is null or char_length(signer_name) between 2 and 150),
  signature_png text check (signature_png is null or char_length(signature_png) <= 300000),
  signer_ip text,
  signer_user_agent text,
  signed_pdf_sha256 text,
  signed_email_sent_at timestamptz,
  signed_email_error text,
  created_at timestamptz not null default now()
);

create index if not exists provider_agreements_application_idx
  on public.provider_agreements (application_id, created_at desc);

create index if not exists provider_agreements_provider_idx
  on public.provider_agreements (provider_id, created_at desc);

alter table public.provider_agreements enable row level security;

grant select, insert, update, delete on public.provider_agreements to authenticated;

drop policy if exists "Admins can manage agreements" on public.provider_agreements;
create policy "Admins can manage agreements"
  on public.provider_agreements for all
  to authenticated
  using (public.is_settlebridge_admin())
  with check (public.is_settlebridge_admin());


-- 3. SIGNING FUNCTIONS (used by the signing page and the agreement email function)
-- Visitors cannot read the agreements table. They can only use these functions,
-- and only with the secret link from their own approval email.

-- Turns the secret link into the stored hash
create or replace function public.agreement_token_hash(p_token text)
returns text
language sql
immutable
set search_path = ''
as $$
  select encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex');
$$;

-- What the signing page shows (no IP addresses or signatures)
create or replace function public.get_agreement_for_signing(p_token text)
returns table (
  reference text,
  version text,
  business_name text,
  contact_name text,
  category_name text,
  location text,
  approved_on date,
  status text,
  signed_at timestamptz,
  signer_name text,
  is_expired boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.reference, a.version, a.business_name, a.contact_name, a.category_name,
         a.location, a.approved_on, a.status, a.signed_at, a.signer_name,
         (a.status = 'sent' and a.token_expires_at < now())
    from public.provider_agreements a
   where a.token_hash = public.agreement_token_hash(p_token)
     and char_length(coalesce(p_token, '')) >= 40;
$$;

-- Signs the agreement. The IP address and browser are taken from the
-- request itself, so they cannot be typed in by the person signing.
create or replace function public.sign_provider_agreement(
  p_token text,
  p_signer_name text,
  p_language text,
  p_signature_png text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_headers json;
  client_ip text;
  client_agent text;
  signed_reference text;
  current_status text;
  is_expired boolean;
begin
  if char_length(coalesce(p_token, '')) < 40 then
    raise exception 'invalid_link';
  end if;

  if char_length(trim(coalesce(p_signer_name, ''))) < 2 then
    raise exception 'name_required';
  end if;

  if p_signature_png is not null
     and (char_length(p_signature_png) > 300000 or p_signature_png !~ '^[A-Za-z0-9+/=]+$') then
    raise exception 'invalid_signature';
  end if;

  begin
    request_headers := current_setting('request.headers', true)::json;
  exception when others then
    request_headers := null;
  end;

  client_ip := coalesce(
    request_headers ->> 'cf-connecting-ip',
    trim(split_part(coalesce(request_headers ->> 'x-forwarded-for', ''), ',', 1))
  );
  client_agent := request_headers ->> 'user-agent';

  update public.provider_agreements a
     set status = 'signed',
         signed_at = now(),
         signer_name = left(trim(p_signer_name), 150),
         signed_language = case when p_language in ('en', 'pt') then p_language else 'en' end,
         signature_png = p_signature_png,
         signer_ip = left(nullif(client_ip, ''), 64),
         signer_user_agent = left(client_agent, 300)
   where a.token_hash = public.agreement_token_hash(p_token)
     and a.status = 'sent'
     and a.token_expires_at > now()
  returning a.reference into signed_reference;

  if signed_reference is null then
    select a.status, a.token_expires_at < now()
      into current_status, is_expired
      from public.provider_agreements a
     where a.token_hash = public.agreement_token_hash(p_token);

    if current_status = 'signed' then
      raise exception 'already_signed';
    elsif current_status = 'void' then
      raise exception 'agreement_void';
    elsif is_expired then
      raise exception 'link_expired';
    else
      raise exception 'invalid_link';
    end if;
  end if;

  return signed_reference;
end;
$$;

-- Everything needed to build the PDF (used by the agreement email function)
create or replace function public.get_agreement_for_pdf(p_token text)
returns setof public.provider_agreements
language sql
stable
security definer
set search_path = ''
as $$
  select a.*
    from public.provider_agreements a
   where a.token_hash = public.agreement_token_hash(p_token)
     and char_length(coalesce(p_token, '')) >= 40;
$$;

-- Records that the signed copy was emailed (only once)
create or replace function public.record_signed_agreement_email(
  p_token text,
  p_pdf_sha256 text,
  p_error text
)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.provider_agreements a
     set signed_pdf_sha256 = coalesce(a.signed_pdf_sha256, left(p_pdf_sha256, 64)),
         signed_email_sent_at = case when p_error is null then now() else a.signed_email_sent_at end,
         signed_email_error = left(p_error, 500)
   where a.token_hash = public.agreement_token_hash(p_token)
     and a.status = 'signed'
     and a.signed_email_sent_at is null;
$$;

revoke all on function public.get_agreement_for_signing(text) from public;
revoke all on function public.sign_provider_agreement(text, text, text, text) from public;
revoke all on function public.get_agreement_for_pdf(text) from public;
revoke all on function public.record_signed_agreement_email(text, text, text) from public;

grant execute on function public.get_agreement_for_signing(text) to anon, authenticated;
grant execute on function public.sign_provider_agreement(text, text, text, text) to anon, authenticated;
grant execute on function public.get_agreement_for_pdf(text) to anon, authenticated;
grant execute on function public.record_signed_agreement_email(text, text, text) to anon, authenticated;
