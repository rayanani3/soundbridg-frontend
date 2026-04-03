import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Convert() {
  const { getToken, BACKEND_URL } = useAuth()
  const [file, setFile] = useState(null)
  const [format, setFormat] = useState('mp3')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const handleConvert = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('format', format)
      const res = await fetch(`${BACKEND_URL}/api/convert`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Conversion failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-2">Convert Audio</h1>
        <p className="text-white/50">Upload a WAV or MP3 and convert it to your desired format.</p>
      </div>

      {/* Drop zone */}
      <div
        className={`dropzone mb-5 ${dragActive ? 'active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".wav,.mp3,.flac" className="hidden" onChange={e => setFile(e.target.files[0])} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)'}}>
            <svg className="w-6 h-6 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          {file ? (
            <div className="text-center">
              <p className="font-medium text-white">{file.name}</p>
              <p className="text-xs text-white/40 mt-0.5">{(file.size / (1024*1024)).toFixed(2)} MB — click to change</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-white/70">Drop a file here or <span className="text-brand-gold">browse</span></p>
              <p className="text-xs text-white/30 mt-1">WAV, MP3, FLAC supported</p>
            </div>
          )}
        </div>
      </div>

      {/* Format select */}
      <div className="glass rounded-xl p-4 mb-5">
        <p className="text-sm font-medium text-white/70 mb-3">Output format</p>
        <div className="flex gap-3">
          {['mp3', 'wav'].map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${format === f ? 'bg-brand-gold text-brand-dark' : 'border border-brand-ocean/30 text-white/60 hover:border-brand-gold/30 hover:text-white'}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">{error}</div>}

      <button
        onClick={handleConvert}
        disabled={!file || uploading}
        className="w-full py-3 rounded-xl font-semibold text-brand-dark bg-brand-gold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Converting...
          </span>
        ) : `Convert to ${format.toUpperCase()}`}
      </button>

      {result && (
        <div className="glass rounded-xl p-5 mt-5">
          <p className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            Conversion complete
          </p>
          {result.url && (
            <a href={result.url} download className="flex items-center gap-2 text-brand-gold hover:underline text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Download converted file
            </a>
          )}
        </div>
      )}
    </div>
  )
}
