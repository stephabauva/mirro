import { createClient } from '@supabase/supabase-js';

import { buildArchiveEntry, generateReading } from '@/lib/oracle/generator';
import { ReadingRequest } from '@/lib/oracle/types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function requestReading(request: ReadingRequest) {
  if (supabase) {
    const { data, error } = await supabase.functions.invoke('oracle-read', {
      body: request,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  const result = generateReading(request);
  return {
    entry: buildArchiveEntry(request, result),
    source: 'local-fallback',
  };
}
