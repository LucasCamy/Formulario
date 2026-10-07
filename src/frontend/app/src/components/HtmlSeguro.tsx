import DOMPurify from 'dompurify'

const OPCOES_PURIFY = {
  ALLOWED_TAGS: ['a', 'strong', 'em', 'b', 'i', 'u', 'br', 'span', 'small', 'mark'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
  FORCE_BODY: false,
}

interface HtmlSeguroProps {
  html: string
  className?: string
}

export function HtmlSeguro({ html, className }: HtmlSeguroProps) {
  const sanitized = DOMPurify.sanitize(html, OPCOES_PURIFY)
  return <span className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />
}
