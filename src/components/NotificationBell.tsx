/**
 * =============================================================================
 * NOTIFICATION BELL — navbar bell, mirrors the HRM main-app component
 * =============================================================================
 * Standalone copy for this submodule: no AuthContext / react-hot-toast deps —
 * it guards on the shared localStorage 'auth_token' instead and polls the
 * same-origin /api/notifications endpoints every 30s.
 * =============================================================================
 */

import { useEffect, useRef, useState } from 'react'

interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'error'
  is_read: boolean
  created_at: string
  link?: string
}

const getToken = () => {
  try {
    return localStorage.getItem('auth_token')
  } catch {
    return null
  }
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Poll for notifications every 30s (guarded on the shared auth token)
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = getToken()
      if (!token) return
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data: Notification[] = await res.json()
          setNotifications(data)
          setUnreadCount(data.filter((n) => !n.is_read).length)
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id: string) => {
    const token = getToken()
    if (!token) return
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (e) {
      console.error(e)
    }
  }

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const token = getToken()
    if (!token) return
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      setUnreadCount((prev) =>
        notifications.find((n) => n.id === id && !n.is_read) ? Math.max(0, prev - 1) : prev,
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div
      style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '0.25rem' }}
      ref={dropdownRef}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.2rem',
          position: 'relative',
          padding: '6px',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Notificações"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              border: '2px solid var(--navbar-bg)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '320px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', fontWeight: 600 }}>
            Notificações
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
              Nenhuma notificação recente.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markAsRead(n.id)}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--glass-border)',
                  cursor: 'pointer',
                  backgroundColor: n.is_read ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
                  transition: 'background 0.2s',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>
                    {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : 'ℹ️'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                      {new Date(n.created_at).toLocaleString('pt-BR')}
                    </div>
                    {n.link && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          const token = getToken()
                          if (!token) return
                          try {
                            const res = await fetch(n.link!, {
                              headers: { Authorization: `Bearer ${token}` },
                            })
                            if (!res.ok) throw new Error('Download failed')
                            const blob = await res.blob()
                            const url = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `export_${new Date().getTime()}.xlsx`
                            document.body.appendChild(a)
                            a.click()
                            window.URL.revokeObjectURL(url)
                            document.body.removeChild(a)
                          } catch (err) {
                            console.error(err)
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          marginTop: '0.5rem',
                          fontSize: '0.8rem',
                          color: 'var(--secondary)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          padding: 0,
                          textDecoration: 'underline',
                        }}
                      >
                        📥 Baixar Arquivo
                      </button>
                    )}
                  </div>
                  <button
                    onClick={(e) => deleteNotification(e, n.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      padding: '4px',
                      alignSelf: 'flex-start',
                    }}
                    title="Excluir"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
