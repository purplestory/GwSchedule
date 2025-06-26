import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    // CORS preflight 요청에 대한 응답
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'googleSheetUrl')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ url: data?.value || '' });
  } else if (req.method === 'POST') {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });
    const { error } = await supabase
      .from('settings')
      .upsert([{ key: 'googleSheetUrl', value: url }], { onConflict: 'key' });
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ ok: true });
  } else {
    res.status(405).end();
  }
} 