"use client"

import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Maximize, Minimize, Play, Pause } from "lucide-react"

interface Props {
  titulo: string
  embedUrl: string | null
  open: boolean
  onOpenChange: (o: boolean) => void
}

// Player de treinamento incorporado. Objetivos:
// - Exibir o video do YouTube dentro do sistema (embed "sem cookies").
// - Nao expor a URL: nenhum link/href e renderizado e a camada por cima
//   bloqueia o menu de contexto do player ("Copiar URL do video").
// O play/pause e controlado por essa camada via YouTube IFrame API (postMessage).
export function VideoTreinamentoDialog({ titulo, embedUrl, open, onOpenChange }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tocando, setTocando] = useState(false)
  const [telaCheia, setTelaCheia] = useState(false)

  // Ao fechar/reabrir, reinicia o estado do botao.
  useEffect(() => {
    if (!open) setTocando(false)
  }, [open])

  function comando(func: "playVideo" | "pauseVideo") {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*",
    )
  }

  function alternar() {
    if (tocando) {
      comando("pauseVideo")
      setTocando(false)
    } else {
      comando("playVideo")
      setTocando(true)
    }
  }

  useEffect(() => {
    function sincronizarTelaCheia() {
      setTelaCheia(Boolean(document.fullscreenElement))
    }
    document.addEventListener("fullscreenchange", sincronizarTelaCheia)
    return () => document.removeEventListener("fullscreenchange", sincronizarTelaCheia)
  }, [])

  async function alternarTelaCheia() {
    const elemento = containerRef.current
    if (!elemento) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await elemento.requestFullscreen()
    }
  }

  // enablejsapi=1 habilita o controle por postMessage; controls/disablekb
  // reduzem a interacao nativa (e o menu de contexto do proprio player).
  const src = embedUrl ? `${embedUrl}&enablejsapi=1&controls=0&disablekb=1` : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-balance pr-6">{titulo}</DialogTitle>
        </DialogHeader>

        {embedUrl ? (
          <div
            ref={containerRef}
            className="group/player relative aspect-video w-full overflow-hidden rounded-md bg-black"
            onContextMenu={(e) => e.preventDefault()}
          >
            <iframe
              ref={iframeRef}
              src={src}
              title={titulo}
              className="pointer-events-none absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
            {/* Camada que captura o clique (play/pause) e bloqueia o menu de contexto. */}
            <button
              type="button"
              onClick={alternar}
              onContextMenu={(e) => e.preventDefault()}
              aria-label={tocando ? "Pausar vídeo" : "Reproduzir vídeo"}
              className="group absolute inset-0 flex items-center justify-center bg-transparent transition-colors hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white transition-opacity ${
                  tocando ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                }`}
              >
                {tocando ? <Pause className="h-7 w-7" /> : <Play className="ml-1 h-7 w-7" />}
              </span>
            </button>

            <button
              type="button"
              onClick={alternarTelaCheia}
              aria-label={telaCheia ? "Sair da tela cheia" : "Tela cheia"}
              className="absolute bottom-2 right-2 z-10 hidden h-9 w-9 items-center justify-center rounded-md bg-black/60 text-white transition-opacity hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
            >
              {telaCheia ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Vídeo indisponível — informe um link válido do YouTube.
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
