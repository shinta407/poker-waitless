'use client'

import { useCallback, useState } from 'react'

/**
 * Hook for playing sound alerts using Web Audio API
 * Generates beeps for 10-minute timeout notifications
 */
export function useSound() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(() => {
    if (typeof window !== 'undefined') {
      return new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return null
  })

  const playAlert = useCallback(() => {
    if (!audioContext) return

    // Resume audio context if suspended (iOS requirement)
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }

    const beep = () => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // 800Hz sine wave tone
      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      // Fade out envelope for smoother sound
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      )

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    }

    // Play 3 beeps with 500ms gap
    beep()
    setTimeout(beep, 500)
    setTimeout(beep, 1000)
  }, [audioContext])

  return { playAlert }
}
