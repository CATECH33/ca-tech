-- Solo mode: allow anon role full access to all prospect tables
-- App runs without Supabase auth session; anon key used for all requests.

-- prospects
CREATE POLICY "anon_insert" ON prospects FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update" ON prospects FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete" ON prospects FOR DELETE TO anon USING (true);

-- prospect_contacts (anon_select already exists)
CREATE POLICY "anon_insert" ON prospect_contacts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update" ON prospect_contacts FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete" ON prospect_contacts FOR DELETE TO anon USING (true);

-- prospect_activities
CREATE POLICY "anon_select" ON prospect_activities FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert" ON prospect_activities FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update" ON prospect_activities FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete" ON prospect_activities FOR DELETE TO anon USING (true);

-- prospect_notes
CREATE POLICY "anon_select" ON prospect_notes FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert" ON prospect_notes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update" ON prospect_notes FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete" ON prospect_notes FOR DELETE TO anon USING (true);

-- prospect_tasks
CREATE POLICY "anon_select" ON prospect_tasks FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert" ON prospect_tasks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update" ON prospect_tasks FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete" ON prospect_tasks FOR DELETE TO anon USING (true);

-- prospect_campaigns
CREATE POLICY "anon_all" ON prospect_campaigns FOR ALL TO anon USING (true) WITH CHECK (true);
