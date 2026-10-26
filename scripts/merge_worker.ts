// Merge D1 batches into single row
export default {
  async fetch(request: Request, env: { AEO_D1: any; DEMAND_ADMIN_SECRET: string }) {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'method not allowed' }), { status: 405 });
    }
    
    const auth = request.headers.get('x-admin-secret');
    if (!auth || auth !== env.DEMAND_ADMIN_SECRET) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    }
    
    try {
      // Read all batches
      const { results } = await env.AEO_D1.prepare(
        'SELECT id, json FROM demand_candidates_cache ORDER BY id'
      ).all();
      
      if (!results || results.length === 0) {
        return new Response(JSON.stringify({ error: 'no data' }), { status: 404 });
      }
      
      // Merge all JSON arrays
      const allCandidates = [];
      for (const row of results) {
        const batch = JSON.parse(row.json);
        allCandidates.push(...batch);
      }
      
      // Delete old rows and insert merged
      await env.AEO_D1.prepare('DELETE FROM demand_candidates_cache').run();
      
      const jsonStr = JSON.stringify(allCandidates);
      const hash = require('crypto').createHash('sha256').update(jsonStr).digest('hex').substring(0, 16);
      const now = new Date().toISOString().replace('+00:00', 'Z');
      
      await env.AEO_D1.prepare(
        "INSERT INTO demand_candidates_cache (loaded_at, json, hash) VALUES (?, ?, ?)"
      ).bind(now, jsonStr, hash).run();
      
      return new Response(JSON.stringify({ 
        success: true, 
        candidates: allCandidates.length, 
        hash,
        sources: {
          github: allCandidates.filter(c => c.provenance?.source_canonical_url?.includes('github.com')).length,
          moltchurch: allCandidates.filter(c => c.provenance?.source_canonical_url?.includes('molt') || !c.provenance?.source_canonical_url?.includes('github')).length,
          thecolony: allCandidates.filter(c => c.provenance?.source_canonical_url?.includes('thecolony')).length,
          moltbook: allCandidates.filter(c => c.provenance?.source_canonical_url?.includes('moltbook')).length,
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }
};
