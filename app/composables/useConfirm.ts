/** Promise-based confirm dialog (replaces window.confirm / alert). Host: <SdConfirmHost/> in app.vue */
interface ConfirmRequest {
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  resolve?: (ok: boolean) => void
}

export function useConfirm() {
  const current = useState<ConfirmRequest | null>('confirm-request', () => null)
  function confirm(opts: Omit<ConfirmRequest, 'resolve'>): Promise<boolean> {
    return new Promise((resolve) => { current.value = { confirmText: 'Confirm', cancelText: 'Cancel', ...opts, resolve } })
  }
  function answer(ok: boolean) {
    current.value?.resolve?.(ok)
    current.value = null
  }
  return { current, confirm, answer }
}
