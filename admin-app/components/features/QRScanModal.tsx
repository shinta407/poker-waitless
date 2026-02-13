'use client'

import React, { useEffect, useRef, useState } from 'react'
import { QrCode, AlertCircle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

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
  onScanSuccess: (userId: string) => Promise<void>
}

export function QRScanModal({ isOpen, onClose, onScanSuccess }: QRScanModalProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const scannerRef = useRef<any>(null)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      // Cleanup scanner when modal closes
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

    // Start scanner when modal opens
    if (!Html5Qrcode || hasStartedRef.current) return
    hasStartedRef.current = true

    const startScanner = async () => {
      try {
        setIsScanning(true)
        setError('')

        const scanner = new Html5Qrcode('qr-reader')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' }, // Use back camera on iPad
          {
            fps: 10, // 10 frames per second
            qrbox: { width: 250, height: 250 }, // Scan area
          },
          async (decodedText: string) => {
            // Success callback
            try {
              // Parse the QR code format: tpds://player/{userId}
              const userId = decodedText.replace('tpds://player/', '')

              if (!userId || userId === decodedText) {
                throw new Error('無効なQRコード形式です')
              }

              // Stop scanner before processing
              await scanner.stop()
              scannerRef.current = null

              // Process the scan
              await onScanSuccess(userId)

              // Close modal
              onClose()
            } catch (err) {
              console.error('Error processing QR code:', err)
              setError('QRコードの処理に失敗しました')
              setIsScanning(false)
            }
          },
          () => {
            // Error callback for frame errors - ignore these
          }
        )
      } catch (err) {
        console.error('Error starting camera:', err)
        setError('カメラにアクセスできません。ブラウザの設定を確認してください。')
        setIsScanning(false)
      }
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
  }, [isOpen, onScanSuccess, onClose])

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .catch((err: any) => console.error('Error stopping scanner:', err))
      scannerRef.current = null
    }
    onClose()
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
        <div className="pt-2">
          <Button
            variant="ghost"
            size="large"
            onClick={handleClose}
            className="w-full"
          >
            キャンセル
          </Button>
        </div>
      </div>
    </Modal>
  )
}
