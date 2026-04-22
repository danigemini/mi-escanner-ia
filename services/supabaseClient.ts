import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qpagdobxywlcmwxchsud.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_PB2Fhyirx4dOizpmmRcXeA_uit0H861';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const TABLE_NAME = 'books';
