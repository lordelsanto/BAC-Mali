'use client'

import { useState, useRef } from 'react'

export default function VoiceRecorder({ onAudioReady, premium }) {
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    if (!premium) {
      alert("Fonction réservée aux comptes Premium")
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)

    mediaRecorderRef.current = mediaRecorder
    chunksRef.current = []

    mediaRecorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      onAudioReady(blob)
    }

    mediaRecorder.start()
    setRecording(true)

    setTimeout(() => {
      mediaRecorder.stop()
      setRecording(false)
    }, 30000) // 30 sec max
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  return (
    <div>
      {!recording ? (
        <button onClick={startRecording}>
          🎙️ Enregistrer (30s max)
        </button>
      ) : (
        <button onClick={stopRecording}>
          ⏹️ Stop
        </button>
      )}
    </div>
  )
}
