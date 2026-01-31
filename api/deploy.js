export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  if (req.headers["x-api-key"] !== process.env.API_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const hook = process.env.VERCEL_DEPLOY_HOOK;

  const r = await fetch(hook, { method: "POST" });

  if (!r.ok) {
    return res.status(500).json({ error: "deploy failed" });
  }

  res.json({ ok: true });
}
