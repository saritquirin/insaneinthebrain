export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, playerCount } = req.body;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const blanksPerStory = Math.ceil(playerCount / 2);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Create two short, earnest-sounding stories (like academic papers, formal reports, or serious articles) about "${prompt}". Each story should be 3-4 sentences long and sound professional/serious.

For each story, identify exactly ${blanksPerStory} places where we can insert fill-in-the-blank prompts. Distribute these types evenly: noun, adjective, verb, place, emotion, animal, food.

Mark each blank with [BLANK:type] where type is the word type needed.

IMPORTANT: Return ONLY valid JSON with no markdown, no explanation, no backticks. Just pure JSON in this exact format:
{
  "story1": {
    "text": "The [BLANK:noun] was discovered in the [BLANK:place]...",
    "blanks": [
      {"position": 0, "type": "noun"},
      {"position": 1, "type": "place"}
    ]
  },
  "story2": {
    "text": "Scientists observed a [BLANK:adjective] phenomenon...",
    "blanks": [
      {"position": 0, "type": "adjective"}
    ]
  }
}`
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Anthropic API error:', data.error);
      throw new Error(data.error.message || 'API error');
    }
    
    if (!data.content || !data.content[0]) {
      console.error('Invalid API response:', data);
      throw new Error('Invalid response from AI');
    }
    
    const content = data.content[0].text;
    console.log('Raw AI response:', content);
    
    // Remove markdown code fences if present
    const cleanContent = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    console.log('Cleaned content:', cleanContent);
    
    // Parse the JSON from Claude's response
    const stories = JSON.parse(cleanContent);
    
    res.status(200).json(stories);
  } catch (error) {
    console.error('Error generating story:', error);
    res.status(500).json({ 
      error: 'Failed to generate story', 
      details: error.message,
      stack: error.stack 
    });
  }
}
