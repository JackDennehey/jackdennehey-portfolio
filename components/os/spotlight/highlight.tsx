import type { ReactNode } from 'react'

export function HighlightedText({
  text,
  query,
}: {
  text: string
  query: string
}) {
  const needle = query.trim()
  if (needle.length < 2) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = needle.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)
  if (index < 0) return text

  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + needle.length)}</mark>
      {text.slice(index + needle.length)}
    </>
  )
}

export function KindLabel({ children }: { children: ReactNode }) {
  return <span className="spotlight-kind">{children}</span>
}
