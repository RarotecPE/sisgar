"use client"

import { useState } from "react"
import useSWR from "swr"
import { useSession } from "@/lib/auth-context"
import { isGestor } from "@/lib/permissions"
import {
  CATEGORIAS_DOC,
  LABEL_CATEGORIA,
  DESCRICAO_CATEGORIA,
  type DocumentoInstitucional,
} from "@/lib/documentos-institucionais"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FolderArchive, Network, ListChecks, ScrollText, Files } from "lucide-react"
import { DocumentosLista } from "@/components/documentos-institucionais-lista"
import { NovoDocumentoDialog } from "@/components/novo-documento-institucional-dialog"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const ICONES: Record<string, React.ElementType> = {
  organograma: Network,
  atribuicoes: ListChecks,
  regulamento: ScrollText,
  demais: Files,
}

export default function DocumentosInstitucionaisPage() {
  const { user } = useSession()
  const userIsGestor = user ? isGestor(user.nome, user.cargo) : false
  const [categoria, setCategoria] = useState<string>("organograma")
  const [novoOpen, setNovoOpen] = useState(false)

  const { data: documentos, isLoading, mutate } = useSWR<DocumentoInstitucional[]>(
    `/api/documentos-institucionais?categoria=${categoria}`,
    fetcher,
  )

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <FolderArchive className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-balance">Documentos Institucionais</h1>
            <p className="text-sm text-muted-foreground">
              Documentos oficiais da empresa disponíveis para consulta
            </p>
          </div>
        </div>
        {userIsGestor && (
          <Button onClick={() => setNovoOpen(true)}>Novo Documento</Button>
        )}
      </div>

      <Tabs value={categoria} onValueChange={setCategoria}>
        <TabsList className="mb-4 flex h-auto flex-wrap justify-start gap-1">
          {CATEGORIAS_DOC.map((cat) => {
            const Icon = ICONES[cat]
            return (
              <TabsTrigger key={cat} value={cat} className="gap-1.5">
                <Icon className="h-4 w-4" />
                {LABEL_CATEGORIA[cat]}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {CATEGORIAS_DOC.map((cat) => (
          <TabsContent key={cat} value={cat} className="mt-0">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-medium">{LABEL_CATEGORIA[cat]}</h2>
                  <p className="text-sm text-muted-foreground">{DESCRICAO_CATEGORIA[cat]}</p>
                </div>
                <DocumentosLista
                  documentos={categoria === cat ? documentos : undefined}
                  isLoading={categoria === cat ? isLoading : false}
                  userIsGestor={userIsGestor}
                  onChanged={() => mutate()}
                  emptyLabel="Nenhum documento cadastrado nesta categoria."
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <NovoDocumentoDialog
        open={novoOpen}
        onOpenChange={setNovoOpen}
        categoriaFixa={categoria}
        onCreated={() => mutate()}
      />
    </div>
  )
}
