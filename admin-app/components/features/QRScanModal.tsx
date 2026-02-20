'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { QrCode, AlertCircle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

// Import html5-qrcode dynamically to avoid SSR issues
let Html5Qrcode: any = null
if (typeof window !== 'undefined') {
  import('html5-qrcode').then((module) => {
    Html5Qrcode = module.Html5Qrcode
  })
}

export interface QRScanModalProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (userId: string, name: string) => Promise<void>
}

export function QRScanModal({ isOpen, onClose, onScanSuccess }: QRScanModalProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const scannerRef = useRef<any>(null)
  const hasStartedRef = useRef(false)

  const startScanner = useCallback(async () => {
    if (!Html5Qrcode || hasStartedRef.current) return
    hasStartedRef.current = true

    try {
      setIsScanning(true)
      setError('')

      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText: string) => {
          try {
            // Parse new format: tpds://player/{userId}?name={encodedName}
            const withoutPrefix = decodedText.replace('tpds://player/', '')
            const [userId, queryString] = withoutPrefix.split('?')
            const params = new URLSearchParams(queryString || '')
            const nameParam = params.get('name')
            let name = nameParam ? decodeURIComponent(nameParam) : ''

            if (!userId || userId === decodedText) {
              throw new Error('無効なQRコード形式です')
            }

            // If name is not in QR code, look up from database
            if (!name) {
              const { data: userData } = await supabase
                .from('users')
                .select('name')
                .eq('id', userId)
                .single()
              name = userData?.name || ''
            }

            if (!name) {
              throw new Error('プレイヤーが名前を登録していません。プレイヤーアプリで名前を保存してください。')
            }

            // Stop scanner before processing
            await scanner.stop()
            scannerRef.current = null

            await onScanSuccess(userId, name)
            onClose()
          } catch (err) {
            console.error('Error processing QR code:', err)
            setError(err instanceof Error ? err.message : 'QRコードの処理に失敗しました')
            setIsScanning(false)
          }
        },
        () => {
          // Frame error callback - ignore
        }
      )
    } catch (err) {
      console.error('Error starting camera:', err)
      setError('カメラにアクセスできません。ブラウザの設定を確認してください。')
      setIsScanning(false)
    }
  }, [onScanSuccess, onClose])

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch((err: any) => console.error('Error stopping scanner:', err))
        scannerRef.current = null
      }
      hasStartedRef.current = false
      setIsScanning(false)
      setError('')
      return
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch((err: any) => console.error('Error stopping scanner:', err))
        scannerRef.current = null
      }
    }
  }, [isOpen, startScanner])

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .catch((err: any) => console.error('Error stopping scanner:', err))
      scannerRef.current = null
    }
    onClose()
  }

  const handleRescan = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
      } catch {}
      scannerRef.current = null
    }
    hasStartedRef.current = false
    setError('')
    setIsScanning(false)
    // Small delay to allow DOM to reset before restarting
    setTimeout(() => {
      startScanner()
    }, 100)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="QRコードスキャン"
      size="medium"
      closeOnBackdropClick={!isScanning}
      closeOnEscape={!isScanning}
    >
      <div className="space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            プレイヤーアプリのQRコードをカメラで読み取ってください
          </p>
        </div>

        {/* QR Scanner */}
        <div className="relative">
          <div
            id="qr-reader"
            className="rounded-lg overflow-hidden bg-black"
            style={{ minHeight: '300px' }}
          />
          {!isScanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">カメラを起動中...</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex gap-3">
          {error && (
            <Button
              variant="primary"
              size="large"
              onClick={handleRescan}
              className="flex-1"
            >
              再スキャン
            </Button>
          )}
          <Button
            variant="ghost"
            size="large"
            onClick={handleClose}
            className={error ? 'flex-1' : 'w-full'}
          >
            キャンセル
          </Button>
        </div>
      </div>
    </Modal>
  )
}
