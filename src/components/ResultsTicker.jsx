import { useState, useEffect, useRef } from 'react'
import './ResultsTicker.css'

/* ── Fallback items shown while fetching or on error ──────── */
const FALLBACK_ITEMS = [
  { stat: 'Global digital ad spend projected to exceed $700B in 2025',                  source: 'Statista',                 url: 'https://www.statista.com/statistics/237974/online-advertising-spending-worldwide/' },
  { stat: 'Short-form video drives 3× higher engagement than static posts',             source: 'HubSpot',                  url: 'https://blog.hubspot.com/marketing/state-of-video-marketing' },
  { stat: 'AI-personalised emails see 41% higher open rates',                           source: 'Salesforce',               url: 'https://www.salesforce.com/resources/research-reports/state-of-marketing/' },
  { stat: 'Brands with consistent social presence grow revenue 23% faster',             source: 'Forbes',                   url: 'https://www.forbes.com/councils/forbesagencycouncil/' },
  { stat: 'Influencer marketing industry to reach $24B globally',                       source: 'Influencer Marketing Hub', url: 'https://influencermarketinghub.com/influencer-marketing-benchmark-report/' },
  { stat: 'Mobile accounts for 60% of all web traffic worldwide',                       source: 'Statista',                 url: 'https://www.statista.com/statistics/277125/share-of-website-traffic-coming-from-mobile-devices/' },
  { stat: 'Businesses using data-driven marketing are 6× more likely to be profitable', source: 'Forbes',                   url: 'https://www.forbes.com/sites/forbesagencycouncil/2023/01/17/the-importance-of-data-driven-marketing/' },
  { stat: 'Instagram Reels generates 22% more engagement than standard video',          source: 'Hootsuite',                url: 'https://blog.hootsuite.com/instagram-reels-tips/' },
  { stat: 'Lead nurturing emails produce 8× more opens than mass emails',               source: 'HubSpot',                  url: 'https://blog.hubspot.com/marketing/lead-nurturing-stats' },
  { stat: 'Companies that blog get 67% more leads per month',                           source: 'DemandMetric',             url: 'https://www.demandmetric.com/content/content-marketing-infographic' },
]

const REFRESH_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes

async function fetchLiveItems() {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: `You are a marketing intelligence assistant. Search for the latest marketing industry statistics and headlines from reputable sources such as Forbes, HubSpot, Statista, Marketing Week, Hootsuite, Salesforce, Sprout Social, and similar.

Return ONLY a valid JSON array of exactly 10 objects. No markdown, no backticks, no explanation — raw JSON only.

Each object must have exactly these three fields:
- "stat": a concise stat or headline, under 12 words, no source name included
- "source": the publisher name (e.g. "Forbes", "HubSpot", "Statista")
- "url": the actual direct URL to the specific article or report page (not a homepage)

Example:
[
  {"stat":"Short-form video boosts engagement by 3x","source":"HubSpot","url":"https://blog.hubspot.com/marketing/video-marketing-statistics"},
  {"stat":"Digital ad spend hits $700B globally","source":"Statista","url":"https://www.statista.com/statistics/237974/online-advertising-spending-worldwide/"}
]`,
      messages: [
        {
          role: 'user',
          content: 'Search for the 10 most recent and impactful marketing industry statistics and news headlines from Forbes, HubSpot, Statista, Marketing Week, Hootsuite, or Sprout Social. For each result include the direct URL to the original article or report. Return as a raw JSON array of objects with stat, source, and url fields only.',
        },
      ],
    }),
  })

  if (!response.ok) throw new Error(`API error ${response.status}`)
  const data = await response.json()

  const textBlock = data.content?.find(b => b.type === 'text')
  if (!textBlock?.text) throw new Error('No text in response')

  const clean = textBlock.text.replace(/```json|```/gi, '').trim()
  const parsed = JSON.parse(clean)

  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid array')

  // Validate each item has all required fields
  const valid = parsed.filter(
    item =>
      item &&
      typeof item.stat === 'string' &&
      typeof item.source === 'string' &&
      typeof item.url === 'string' &&
      item.url.startsWith('http')
  )
  if (valid.length === 0) throw new Error('No valid items')

  return valid.slice(0, 10)
}

export default function ResultsTicker() {
  const [items, setItems]     = useState(FALLBACK_ITEMS)
  const [isLive, setIsLive]   = useState(false)
  const [loading, setLoading] = useState(true)
  const timerRef              = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const fresh = await fetchLiveItems()
      setItems(fresh)
      setIsLive(true)
    } catch (err) {
      console.warn('[ResultsTicker] fetch failed, using fallback:', err.message)
      setItems(FALLBACK_ITEMS)
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    timerRef.current = setInterval(load, REFRESH_INTERVAL_MS)
    return () => clearInterval(timerRef.current)
  }, [])

  // Double for seamless CSS loop
  const doubled = [...items, ...items]

  return (
    <div className="ticker-wrap" aria-label="Marketing industry news ticker" aria-live="off">
      <div className="ticker-label">
        <span>{isLive ? 'LIVE INDUSTRY' : 'INDUSTRY'}</span>
        <span className={`ticker-dot${loading ? ' ticker-dot--loading' : ''}`} />
      </div>
      <div className="ticker-track">
        <div className="ticker-inner" key={items.map(i => i.stat).join('|')}>
          {doubled.map((item, i) => (
            <a
              key={i}
              className="ticker-item ticker-item--link"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`Read on ${item.source}`}
            >
              <span className="ticker-check">✦</span>
              {item.stat}
              <span className="ticker-source"> — {item.source}</span>
              <span className="ticker-arrow">↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}