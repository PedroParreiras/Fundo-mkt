import { useCallback, useEffect, useRef, useState } from 'react'

/** Toast do protótipo: uma mensagem por vez, some sozinha em 2,4s. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toast = useCallback((msg: string) => {
    setMessage(msg)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 2400)
  }, [])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return { message, toast }
}
