"use client"

import { useEffect } from "react"

/**
 * Corrige o aviso benigno "ResizeObserver loop completed with undelivered
 * notifications", comum quando componentes que remedem layout (ex.: gráficos
 * Recharts, componentes Radix) disparam observações em cadeia no mesmo frame.
 *
 * Causa raiz: envolvemos o callback do ResizeObserver em requestAnimationFrame,
 * adiando-o para o próximo frame e quebrando o loop síncrono que gera o aviso.
 * Reforço: silenciamos apenas essa mensagem específica para não acionar o
 * overlay de erros do dev, sem esconder erros reais.
 */
export function ResizeObserverFix() {
  useEffect(() => {
    if (typeof window === "undefined") return

    const NativeResizeObserver = window.ResizeObserver
    let patched = false

    if (NativeResizeObserver && !(NativeResizeObserver as { __patched?: boolean }).__patched) {
      class PatchedResizeObserver extends NativeResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          super((entries, observer) => {
            window.requestAnimationFrame(() => {
              callback(entries, observer)
            })
          })
        }
      }
      ;(PatchedResizeObserver as { __patched?: boolean }).__patched = true
      window.ResizeObserver = PatchedResizeObserver
      patched = true
    }

    const isBenign = (message?: string) =>
      typeof message === "string" && message.includes("ResizeObserver loop")

    const onError = (event: ErrorEvent) => {
      if (isBenign(event.message)) {
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    }

    window.addEventListener("error", onError)

    return () => {
      window.removeEventListener("error", onError)
      if (patched) {
        window.ResizeObserver = NativeResizeObserver
      }
    }
  }, [])

  return null
}
