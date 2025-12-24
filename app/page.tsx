'use client'

import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(-10)
  const [tempo, setTempo] = useState(140)
  const [currentLyric, setCurrentLyric] = useState('')
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  const sequenceRef = useRef<number | null>(null)
  const lyricsIntervalRef = useRef<number | null>(null)

  const lyrics = [
    "Vee é um robô safado",
    "ele pega, ele chuta",
    "e ele faz tudo de maldadeeee",
    "lalala, lalala, lalala, lalala"
  ]

  const playPhonk = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    setAudioContext(ctx)

    const now = ctx.currentTime
    let time = now
    const beatDuration = 60 / tempo

    // Create oscillators and filters for Phonk sound
    const playBass = (freq: number, when: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = 'sine'
      osc.frequency.value = freq
      filter.type = 'lowpass'
      filter.frequency.value = 200

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      gain.gain.setValueAtTime(0.4, when)
      gain.gain.exponentialRampToValueAtTime(0.01, when + 0.5)

      osc.start(when)
      osc.stop(when + 0.5)
    }

    const playKick = (when: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.frequency.setValueAtTime(150, when)
      osc.frequency.exponentialRampToValueAtTime(40, when + 0.1)

      gain.gain.setValueAtTime(0.8, when)
      gain.gain.exponentialRampToValueAtTime(0.01, when + 0.3)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(when)
      osc.stop(when + 0.3)
    }

    const playHiHat = (when: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = 'square'
      osc.frequency.value = 10000
      filter.type = 'highpass'
      filter.frequency.value = 7000

      gain.gain.setValueAtTime(0.1, when)
      gain.gain.exponentialRampToValueAtTime(0.01, when + 0.05)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(when)
      osc.stop(when + 0.05)
    }

    const playSnare = (when: number) => {
      const osc = ctx.createOscillator()
      const noise = ctx.createBufferSource()
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate)
      const noiseData = noiseBuffer.getChannelData(0)

      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] = Math.random() * 2 - 1
      }

      noise.buffer = noiseBuffer

      const noiseGain = ctx.createGain()
      const oscGain = ctx.createGain()

      osc.frequency.value = 200

      noiseGain.gain.setValueAtTime(0.3, when)
      noiseGain.gain.exponentialRampToValueAtTime(0.01, when + 0.2)

      oscGain.gain.setValueAtTime(0.1, when)
      oscGain.gain.exponentialRampToValueAtTime(0.01, when + 0.1)

      noise.connect(noiseGain)
      noiseGain.connect(ctx.destination)

      osc.connect(oscGain)
      oscGain.connect(ctx.destination)

      noise.start(when)
      osc.start(when)
      noise.stop(when + 0.2)
      osc.stop(when + 0.1)
    }

    const playChord = (freqs: number[], when: number, duration: number) => {
      freqs.forEach(freq => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()

        osc.type = 'sawtooth'
        osc.frequency.value = freq
        filter.type = 'lowpass'
        filter.frequency.value = 800

        gain.gain.setValueAtTime(0.1, when)
        gain.gain.setValueAtTime(0.1, when + duration - 0.1)
        gain.gain.exponentialRampToValueAtTime(0.01, when + duration)

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)

        osc.start(when)
        osc.stop(when + duration)
      })
    }

    // Brazilian Phonk progression
    const progression = [
      [130.81, 155.56, 196.00], // C2, Eb2, G2
      [116.54, 138.59, 174.61], // Bb1, Db2, F2
      [103.83, 130.81, 155.56], // Ab1, C2, Eb2
      [98.00, 116.54, 146.83]   // G1, Bb1, D2
    ]

    const bassLine = [65.41, 58.27, 51.91, 49.00] // C1, Bb0, Ab0, G0

    let lyricIndex = 0
    let beatCount = 0
    let chordIndex = 0

    const playLoop = () => {
      const measure = Math.floor(beatCount / 4)
      const beat = beatCount % 4

      // Kick on 1 and 3
      if (beat === 0 || beat === 2) {
        playKick(time)
      }

      // Snare on 2 and 4
      if (beat === 1 || beat === 3) {
        playSnare(time)
      }

      // Hi-hats on every beat
      playHiHat(time)
      playHiHat(time + beatDuration / 2)

      // Bass every 4 beats
      if (beat === 0) {
        playBass(bassLine[measure % bassLine.length], time)
      }

      // Chords every 8 beats
      if (beatCount % 8 === 0) {
        playChord(progression[chordIndex % progression.length], time, beatDuration * 8)
        chordIndex++
      }

      time += beatDuration
      beatCount++

      if (beatCount < 128) { // Play for 32 bars
        sequenceRef.current = window.setTimeout(playLoop, beatDuration * 1000)
      }
    }

    playLoop()

    // Lyrics display
    lyricsIntervalRef.current = window.setInterval(() => {
      setCurrentLyric(lyrics[lyricIndex])
      lyricIndex = (lyricIndex + 1) % lyrics.length
    }, beatDuration * 1000 * 2)

    setIsPlaying(true)
  }

  const stopPhonk = () => {
    if (sequenceRef.current !== null) {
      clearTimeout(sequenceRef.current)
      sequenceRef.current = null
    }
    if (lyricsIntervalRef.current !== null) {
      clearInterval(lyricsIntervalRef.current)
      lyricsIntervalRef.current = null
    }
    if (audioContext) {
      audioContext.close()
      setAudioContext(null)
    }
    setIsPlaying(false)
    setCurrentLyric('')
  }

  const togglePlay = () => {
    if (isPlaying) {
      stopPhonk()
    } else {
      playPhonk()
    }
  }

  useEffect(() => {
    return () => {
      stopPhonk()
    }
  }, [])

  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '10px',
          textAlign: 'center',
          textShadow: '0 0 20px rgba(255, 0, 255, 0.8)'
        }}>
          🤖 VEE O ROBÔ SAFADO
        </h1>

        <h2 style={{
          fontSize: '1.2rem',
          marginBottom: '30px',
          textAlign: 'center',
          color: '#ff00ff',
          fontWeight: 'normal'
        }}>
          Brazilian Phonk Generator
        </h2>

        <div style={{
          background: 'rgba(255, 0, 255, 0.1)',
          borderRadius: '10px',
          padding: '30px',
          marginBottom: '30px',
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(255, 0, 255, 0.3)'
        }}>
          <p style={{
            fontSize: '1.5rem',
            textAlign: 'center',
            fontWeight: 'bold',
            animation: isPlaying ? 'pulse 0.5s ease-in-out infinite' : 'none'
          }}>
            {currentLyric || 'Press play to start...'}
          </p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '1rem' }}>
            Tempo: {tempo} BPM
          </label>
          <input
            type="range"
            min="120"
            max="160"
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
            disabled={isPlaying}
            style={{ width: '100%' }}
          />
        </div>

        <button
          onClick={togglePlay}
          style={{
            width: '100%',
            padding: '20px',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '10px',
            background: isPlaying
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)'
          }}
        >
          {isPlaying ? '⏸ STOP' : '▶ PLAY PHONK'}
        </button>

        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '10px',
          fontSize: '0.9rem',
          lineHeight: '1.6'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#ff00ff' }}>Lyrics:</h3>
          {lyrics.map((line, i) => (
            <p key={i} style={{ marginBottom: '5px' }}>• {line}</p>
          ))}
          <p style={{ marginTop: '10px', fontStyle: 'italic', opacity: 0.7 }}>
            (repeats continuously)
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </main>
  )
}
