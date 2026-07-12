-- Solo mode: allow anon role full access to campaigns and campaign_steps
CREATE POLICY "anon_all" ON campaigns FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON campaign_steps FOR ALL TO anon USING (true) WITH CHECK (true);
