export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const html = await response.text();

    // better title detection
    let title =
      html.match(/<meta property="og:title" content="(.*?)"/i)?.[1] ||
      html.match(/<meta name="twitter:title" content="(.*?)"/i)?.[1] ||
      html.match(/<title>(.*?)<\/title>/i)?.[1];

    // clean content
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // fallback title
    if (!title) {
      title = cleaned.substring(0, 60) + "...";
    }

    res.status(200).json({
      title,
      content: cleaned.substring(0, 3000),
    });

  } catch (error) {
    res.status(500).json({ error: "Import failed" });
  }
}