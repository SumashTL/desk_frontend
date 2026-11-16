/**
 * Split message text into plain text and links, so links can be rendered as <a> tags
 * without v-html (the text stays escaped by Vue).
 */
export interface TextPart { text: string, href?: string }

const LINK = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+/gi
// punctuation that usually ends a sentence rather than the link
const TRAILING = /[.,!?;:'"।)\]}>…]+$/

export function linkParts(text: string): TextPart[] {
  const parts: TextPart[] = []
  let last = 0
  for (const match of (text || '').matchAll(LINK)) {
    let link = match[0]
    const trail = link.match(TRAILING)?.[0] || ''
    // keep a closing bracket that belongs to the link, e.g. https://en.wikipedia.org/wiki/X_(Y)
    const keep = trail.startsWith(')') && link.slice(0, -trail.length).includes('(') ? 1 : 0
    if (trail.length > keep) link = link.slice(0, link.length - (trail.length - keep))
    const start = match.index ?? 0
    if (start > last) parts.push({ text: text.slice(last, start) })
    parts.push({ text: link, href: /^https?:\/\//i.test(link) ? link : `https://${link}` })
    last = start + link.length
  }
  if (last < (text || '').length) parts.push({ text: text.slice(last) })
  return parts
}

export function firstLink(text: string): string | undefined {
  return linkParts(text).find(p => p.href)?.href
}