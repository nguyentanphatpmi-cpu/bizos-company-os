-- =============================================================================
-- BIZOS — Row-Level Security policies
-- Role matrix (Mục 10): ceo, cfo, hr_admin, dept_head, team_lead, employee, auditor
-- Multi-tenant key: company_id must match caller's company_id in user_roles.
-- =============================================================================

-- Helper: current caller's company_id (from user_roles). Takes the first active
-- role; if a user belongs to multiple companies they should authenticate per
-- company context (future work).
create or replace function current_company_id() returns uuid
language sql stable security definer
set search_path = public as $$
  select company_id from public.user_roles
  where auth_user_id = auth.uid()
  order by created_at asc
  limit 1;
$$;

create or replace function has_role(target app_role) returns boolean
language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where auth_user_id = auth.uid()
      and company_id = current_company_id()
      and role = target
  );
$$;

create or replace function has_any_role(variadic roles app_role[]) returns boolean
language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where auth_user_id = auth.uid()
      and company_id = current_company_id()
      and role = any(roles)
  );
$$;

create or replace function current_employee_id() returns uuid
language sql stable security definer
set search_path = public as $$
  select id from public.employees
  where auth_user_id = auth.uid()
    and company_id = current_company_id()
  limit 1;
$$;

create or replace function is_dept_head_of(dept uuid) returns boolean
language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where auth_user_id = auth.uid()
      and company_id = current_company_id()
      and role = 'dept_head'
      and (scope_department_id = dept or scope_department_id is null)
  );
$$;

-- =============================================================================
-- Enable RLS + generic company_id policies
-- =============================================================================
do $$
declare 
  t text;
  has_company_id boolean;
  table_exists boolean;
begin
  foreach t in array array[
    'companies','business_units','departments','teams','positions',
    'employees','employee_reporting_lines','employment_contracts','user_roles',
    'kpis','kpi_formulas','kpi_dependencies','kpi_targets','kpi_actuals',
    'kpi_thresholds','kpi_audit_logs',
    'sla_rules','tasks','task_recurrences','task_outputs','task_status_logs','workload_snapshots',
    'compensation_plans','salary_components','bonus_rules','commission_rules',
    'payroll_periods','payroll_entries','adjustment_entries',
    'projects','project_members','project_milestones','project_budgets','project_roi_records','project_dependencies',
    'chart_of_accounts','cost_centers','accounting_entries','budgets','budget_lines',
    'ar_ap_records','cashflow_records','financial_snapshots',
    'objectives','key_results','okr_alignments',
    'job_requisitions','candidates','skill_matrix','training_needs',
    'sop_documents','playbooks','checklists',
    'approvals','approval_steps','alert_rules','alerts','reports','report_schedules',
    'notifications','audit_logs',
    'integrations','import_jobs','app_settings','user_preferences','user_sessions'
  ]
  loop
    -- 1. Check if table exists
    select exists (
      select 1 from information_schema.tables 
      where table_schema = 'public' and table_name = t
    ) into table_exists;

    if table_exists then
      execute format('alter table public.%I enable row level security;', t);
      
      -- 2. Create generic tenant policy based on table structure
      if t = 'companies' then
        execute format('drop policy if exists tenant_select on public.%I;', t);
        execute format('create policy tenant_select on public.%I for select using (id = current_company_id());', t);
      else
        select exists (
          select 1 from information_schema.columns 
          where table_schema = 'public' and table_name = t and column_name = 'company_id'
        ) into has_company_id;

        if has_company_id then
          execute format('drop policy if exists tenant_select on public.%I;', t);
          execute format('create policy tenant_select on public.%I for select using (company_id = current_company_id());', t);
        end if;
      end if;
    end if;
  end loop;
end $$;

-- =============================================================================
-- Specific writes
-- =============================================================================

-- Companies: only CEO can create/update the company row.
drop policy if exists companies_write on public.companies;
create policy companies_write on public.companies
for all using (id = current_company_id() and has_role('ceo'))
with check (id = current_company_id() and has_role('ceo'));

-- Departments, teams, positions, business_units: CEO or HR admin writes.
do $$
declare t text;
begin
  foreach t in array array['business_units','departments','teams','positions']
  loop
    execute format('drop policy if exists %I_write on public.%I;', t, t);
    execute format($f$
      create policy %I_write on public.%I
      for all using (company_id = current_company_id() and has_any_role('ceo','hr_admin'))
      with check (company_id = current_company_id() and has_any_role('ceo','hr_admin'));
    $f$, t, t);
  end loop;
end $$;

-- Employees: CEO/HR admin writes. Each employee can update their own row (basic fields only — enforce in app).
drop policy if exists employees_write_admin on public.employees;
create policy employees_write_admin on public.employees
for all using (company_id = current_company_id() and has_any_role('ceo','hr_admin'))
with check (company_id = current_company_id() and has_any_role('ceo','hr_admin'));

drop policy if exists employees_self_update on public.employees;
create policy employees_self_update on public.employees
for update using (auth_user_id = auth.uid() and company_id = current_company_id())
with check (auth_user_id = auth.uid() and company_id = current_company_id());

-- KPIs: CEO/CFO/dept_head write (dept_head limited to their scope in app layer).
drop policy if exists kpis_write on public.kpis;
create policy kpis_write on public.kpis
for all using (company_id = current_company_id() and has_any_role('ceo','cfo','hr_admin','dept_head'))
with check (company_id = current_company_id() and has_any_role('ceo','cfo','hr_admin','dept_head'));

-- Tasks: assignee/reviewer/manager/dept_head/ceo can see, assignee can update own.
drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks
for select using (
  company_id = current_company_id()
  and (
    has_any_role('ceo','cfo','hr_admin','auditor')
    or assignee_id = current_employee_id()
    or reviewer_id = current_employee_id()
    or (department_id is not null and is_dept_head_of(department_id))
  )
);

drop policy if exists tasks_write on public.tasks;
create policy tasks_write on public.tasks
for all using (
  company_id = current_company_id()
  and (
    has_any_role('ceo','hr_admin','dept_head','team_lead')
    or assignee_id = current_employee_id()
  )
) with check (company_id = current_company_id());

-- Payroll entries: CEO/CFO/HR admin read all. Employee can read own only.
drop policy if exists payroll_entries_select on public.payroll_entries;
create policy payroll_entries_select on public.payroll_entries
for select using (
  company_id = current_company_id()
  and (
    has_any_role('ceo','cfo','hr_admin','auditor')
    or employee_id = current_employee_id()
  )
);

drop policy if exists payroll_entries_write on public.payroll_entries;
create policy payroll_entries_write on public.payroll_entries
for all using (company_id = current_company_id() and has_any_role('ceo','cfo','hr_admin'))
with check (company_id = current_company_id() and has_any_role('ceo','cfo','hr_admin'));

-- Finance (accounting_entries, budgets, cashflow): CEO/CFO/auditor read. Only CEO/CFO write.
drop policy if exists accounting_select on public.accounting_entries;
create policy accounting_select on public.accounting_entries
for select using (company_id = current_company_id() and has_any_role('ceo','cfo','auditor'));

drop policy if exists accounting_write on public.accounting_entries;
create policy accounting_write on public.accounting_entries
for all using (company_id = current_company_id() and has_any_role('ceo','cfo'))
with check (company_id = current_company_id() and has_any_role('ceo','cfo'));

-- Audit log: ceo + auditor read. Inserts via service role.
drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
for select using (company_id = current_company_id() and has_any_role('ceo','auditor'));

-- Notifications: each user reads their own.
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
for select using (company_id = current_company_id() and auth_user_id = auth.uid());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
for update using (company_id = current_company_id() and auth_user_id = auth.uid())
with check (company_id = current_company_id() and auth_user_id = auth.uid());

drop policy if exists user_preferences_select on public.user_preferences;
create policy user_preferences_select on public.user_preferences
for select using (company_id = current_company_id() and auth_user_id = auth.uid());

drop policy if exists user_preferences_write on public.user_preferences;
create policy user_preferences_write on public.user_preferences
for all using (company_id = current_company_id() and auth_user_id = auth.uid())
with check (company_id = current_company_id() and auth_user_id = auth.uid());

drop policy if exists user_sessions_select on public.user_sessions;
create policy user_sessions_select on public.user_sessions
for select using (company_id = current_company_id() and auth_user_id = auth.uid());
