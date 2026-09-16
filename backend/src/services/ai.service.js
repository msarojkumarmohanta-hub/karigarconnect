const logger = require('../utils/logger');

async function requestAI(prompt, imageUrl) {
  if (!process.env.AI_API_KEY) return null;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_API_KEY}` },
    body: JSON.stringify({ model: process.env.AI_MODEL || 'gpt-4o-mini', temperature: 0.3, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: imageUrl ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageUrl } }] : prompt }] })
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const json = await response.json();
  return JSON.parse(json.choices[0].message.content);
}

async function catalog(input) {
  try {
    const result = await requestAI('Analyze this artisan product image. Return JSON with title, description, category, tags, materials, targetCustomers, seoKeywords, suggestedPrice {min,max,recommended}, confidence. Do not invent artisan facts.', input.imageUrl);
    if (result) return { ...result, provider: 'openai' };
  } catch (error) { logger.warn({ err: error }, 'AI catalog request failed'); }
  return { title: 'Handcrafted Artisan Product', description: 'A handmade product created using traditional artisan techniques. Please review and edit this AI-generated draft before publishing.', category: input.category || 'Handicrafts', tags: ['handmade', 'traditional craft', 'Indian handicraft'], materials: input.materials || [], targetCustomers: ['home decor buyers', 'gift shoppers'], seoKeywords: ['handmade Indian craft', 'artisan product'], suggestedPrice: { min: 500, max: 1500, recommended: 950 }, confidence: 0.35, provider: 'fallback', fallback: true };
}

async function textGeneration(kind, input) {
  try {
    const result = await requestAI(`Generate culturally respectful ${kind} for an artisan marketplace. Return JSON only. Use language ${input.language || 'en'}. Do not invent facts; only use supplied fields: ${JSON.stringify(input)}`);
    if (result) return { ...result, provider: 'openai' };
  } catch (error) { logger.warn({ err: error }, `AI ${kind} request failed`); }
  if (kind === 'tags') return { tags: ['handmade', 'traditional craft', input.category || 'artisan product'], fallback: true };
  if (kind === 'price suggestion') return { currency: 'INR', recommendedPrice: 950, priceRange: { min: 500, max: 1500 }, confidence: 0.3, factors: ['Material', 'Craft complexity'], fallback: true };
  return { shortDescription: `${input.title || 'Handmade product'} made with ${input.materials?.join(', ') || 'traditional materials'}.`, detailedDescription: 'A thoughtful handmade product from a skilled artisan. Review all details before publishing.', marketplaceDescription: 'Bring home a unique artisan-made piece.', seoKeywords: [input.title, input.category, 'handmade craft'].filter(Boolean), fallback: true };
}
module.exports = { catalog, textGeneration };
