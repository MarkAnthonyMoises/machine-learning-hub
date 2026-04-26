import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);

    const title = $("title").first().text();

    let content = "";
    $("p").each((i, el) => {
      content += $(el).text() + "\n\n";
    });

    res.status(200).json({
      title,
      content
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch article" });
  }
}