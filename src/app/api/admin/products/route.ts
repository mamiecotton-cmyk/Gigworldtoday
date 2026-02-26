import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return { error: 'Missing SUPABASE env vars' };

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return { supabaseAdmin };
}

export async function GET() {
  const res = getSupabaseAdmin();
  if ('error' in res) return NextResponse.json({ error: res.error }, { status: 500 });
  const { supabaseAdmin } = res;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('GET products error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const resClient = getSupabaseAdmin();
    if ('error' in resClient) return NextResponse.json({ error: resClient.error }, { status: 500 });
    const { supabaseAdmin } = resClient;
    const body = await req.json();

    // Normalize payload: ensure images is an array
    if (body.images && !Array.isArray(body.images)) {
      return NextResponse.json({ error: 'images must be an array' }, { status: 400 });
    }

    // Insert expects array or object; using array is more explicit
    const payload = Array.isArray(body) ? body : [body];

    const { data, error } = await supabaseAdmin.from('products').insert(payload).select();
    if (error) {
      console.error('POST products error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    console.error('POST products exception:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const resClient = getSupabaseAdmin();
    if ('error' in resClient) return NextResponse.json({ error: resClient.error }, { status: 500 });
    const { supabaseAdmin } = resClient;
    const body = await req.json();
    const { id, ...payload } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    if (payload.images && !Array.isArray(payload.images)) {
      return NextResponse.json({ error: 'images must be an array' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from('products').update(payload).eq('id', id).select();
    if (error) {
      console.error('PUT products error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('PUT products exception:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const resClient = getSupabaseAdmin();
    if ('error' in resClient) return NextResponse.json({ error: resClient.error }, { status: 500 });
    const { supabaseAdmin } = resClient;
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('products').delete().eq('id', id).select();
    if (error) {
      console.error('DELETE products error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('DELETE products exception:', err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}