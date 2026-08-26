import { NextResponse } from "next/server"
import { Resend } from "resend"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { RelatorioEmail } from "@/lib/email-templates/relatorio-email"

// Lazy initialization of Resend to avoid build errors
let _resend: Resend | null = null
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

// Email remetente - configure com seu domínio verificado no Resend
// Para testes, use "onboarding@resend.dev"
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "SISGAR <onboarding@resend.dev>"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { relatorioId, destinatarios } = await request.json()

    if (!relatorioId) {
      return NextResponse.json({ error: "ID do relatório é obrigatório" }, { status: 400 })
    }

    if (!destinatarios || destinatarios.length === 0) {
      return NextResponse.json({ error: "Selecione pelo menos um destinatário" }, { status: 400 })
    }

    // Buscar dados do relatório
    const relatorios = await sql`
      SELECT 
        r.*,
        t.nome as tecnico_nome,
        t.email as tecnico_email,
        c.nome as cliente_nome,
        c.email as cliente_email,
        c.municipio
      FROM relatorios_visitas r
      LEFT JOIN tecnicos_rarotec t ON r.tecnico_id = t.id
      LEFT JOIN clientes c ON r.cliente_id = c.id
      WHERE r.id = ${relatorioId}
    `

    if (relatorios.length === 0) {
      return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 })
    }

    const relatorio = relatorios[0]

    // Formatar data
    const dataVisita = relatorio.data_inicio 
      ? new Date(relatorio.data_inicio).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        })
      : "Não informada"

    // URL de validação
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000"
    const validacaoUrl = `${baseUrl}/validar/${relatorio.numero_autenticacao}`

    // Coletar emails dos destinatários
    const emails: string[] = []
    
    if (destinatarios.includes("tecnico") && relatorio.tecnico_email) {
      emails.push(relatorio.tecnico_email)
    }
    
    if (destinatarios.includes("cliente") && relatorio.cliente_email) {
      emails.push(relatorio.cliente_email)
    }

    // Adicionar emails personalizados
    const emailsPersonalizados = destinatarios.filter(
      (d: string) => d !== "tecnico" && d !== "cliente" && d.includes("@")
    )
    emails.push(...emailsPersonalizados)

    if (emails.length === 0) {
      return NextResponse.json({ 
        error: "Nenhum email válido encontrado para os destinatários selecionados" 
      }, { status: 400 })
    }

    // Enviar email
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: emails,
      subject: `Relatório de ${relatorio.tipo_servico || "Visita Técnica"} - ${relatorio.cliente_nome || "Cliente"}`,
      react: RelatorioEmail({
        tecnicoNome: relatorio.tecnico_nome || "Não informado",
        clienteNome: relatorio.cliente_nome || "Não informado",
        tipoServico: relatorio.tipo_servico || "Visita Técnica",
        dataVisita,
        municipio: relatorio.municipio,
        numeroAutenticacao: relatorio.numero_autenticacao,
        resumoServico: relatorio.resumo_servico,
        validacaoUrl,
      }),
    })

    if (error) {
      console.error("[v0] Erro ao enviar email:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Email enviado com sucesso para ${emails.length} destinatário(s)`,
      emailId: data?.id,
      destinatarios: emails
    })

  } catch (error) {
    console.error("[v0] Erro no envio de email:", error)
    return NextResponse.json(
      { error: "Erro ao enviar email" },
      { status: 500 }
    )
  }
}
