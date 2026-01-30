export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  if (req.headers["x-api-key"] !== process.env.API_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { filename, folder, base64 } = req.body;

  const content = base64; // déjà en base64
  const path = `public/photos/${folder}/${filename}`;

  const url = `https://api.github.com/repos/Paul-KERHERVE/stereo/contents/${path}`;

  // vérifier si le fichier existe déjà
  const current = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "vercel"
    }
  }).then(r => r.ok ? r.json() : null);

  const payload = {
    message: `upload ${folder}/${filename}`,
    content,
    branch: process.env.GITHUB_BRANCH
  };

  if (current?.sha) payload.sha = current.sha;

  const update = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!update.ok) {
    return res.status(500).json({ error: await update.text() });
  }

  res.json({ ok: true });
}
