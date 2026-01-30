export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  // auth minimale
  if (req.headers["x-api-key"] !== process.env.API_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const json = req.body;

  const content = Buffer.from(
    JSON.stringify(json, null, 2)
  ).toString("base64");

  const url = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${process.env.JSON_PATH}`;

  // récupérer le SHA actuel de images.json
  const current = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "vercel"
    }
  }).then(r => r.json());

  // commit GitHub
  const update = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "update images.json",
      content,
      sha: current.sha,
      branch: process.env.GITHUB_BRANCH
    })
  });

  if (!update.ok) {
    return res.status(500).json({ error: await update.text() });
  }

  res.json({ ok: true });
}
