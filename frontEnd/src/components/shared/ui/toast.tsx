'use client'

import { toast } from 'react-toastify'
import type { ToastPosition } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  position?: ToastPosition
}

export const showToast = ({ message, type = 'error' ,position = 'top-right'}: ToastProps) => {
  toast[type](message, {
    position: position,
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined
  })
}

export default showToast
