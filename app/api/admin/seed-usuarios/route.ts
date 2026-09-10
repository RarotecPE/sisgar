import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getSession } from "@/lib/auth"


const USUARIOS = [
  { nome: "Administrador", email: "admin@rarotec.com.br", cargo: "Administrador", setor: "Administração do Software", senhaEspecial: true },
  { nome: "Juan Gonzalez", email: "juan.gonzalez@rarotec.com.br", cargo: "Funcionário", setor: "Tributos, B.I. e Portal da Transparência", senhaEspecial: true },
  { nome: "Maurício Silva", email: "mauricio@rarotec.com.br", cargo: "Funcionário", setor: "Contabilidade" },
  { nome: "Danielle Castilho", email: "danielle@rarotec.com.br", cargo: "Funcionário", setor: "Logística" },
  { nome: "Financeiro", email: "financeiro@rarotec.com.br", cargo: "Financeiro", setor: "Financeiro" },
  { nome: "Danielle do Nascimento", email: "danielletavares@rarotec.com.br", cargo: "Funcionário", setor: "Recursos Humanos" },
  { nome: "Gerlane Dino", email: "gerlane@rarotec.com.br", cargo: "Funcionário", setor: "Recursos Humanos" },
  { nome: "Larissa Ferreira", email: "larissa@rarotec.com.br", cargo: "Funcionário", setor: "Recursos Humanos" },
  { nome: "Jeferson Santana", email: "jeferson@rarotec.com.br", cargo: "Funcionário", setor: "Tributos, Portal da Transparência e Logística" },
  { nome: "Mauro Neto", email: "mauro@rarotec.com.br", cargo: "Funcionário", setor: "Recursos Humanos" },
  { nome: "Alan Fernandes", email: "alanfernandes@rarotec.com.br", cargo: "Funcionário", setor: "Contabilidade" },
  { nome: "Michaelly Brandão", email: "mikaellybrandao@rarotec.com.br", cargo: "Funcionário", setor: "Contabilidade" },
  { nome: "Eugênio Albuquerque", email: "eugenio@rarotec.com.br", cargo: "Funcionário", setor: "Recursos Humanos" },
  { nome: "Manoel Cabral", email: "manoel@rarotec.com.br", cargo: "Funcionário", setor: "Contabilidade e Patrimônio" },
  { nome: "José Lúcio", email: "luciomonteiro@rarotec.com.br", cargo: "Funcionário", setor: "Contabilidade" },
  { nome: "Fábio Júnior", email: "fabiojunior@rarotec.com.br", cargo: "Funcionário", setor: "Tributos e Portal da Transparência" },
  { nome: "Felipe Santos", email: "felipesantos@rarotec.com.br", cargo: "Funcionário", setor: "Logística" },
  { nome: "Jairo Filho", email: "jairofilho@rarotec.com.br", cargo: "Funcionário", setor: "Recursos Humanos" },
  { nome: "Altarlê Macedo", email: "altarle.macedo16@gmail.com", cargo: "Funcionário", setor: "Logística" },
  { nome: "Rafaelle Macedo", email: "rafaelle@rarotec.com.br", cargo: "Gestor", setor: "Diretoria Administrativa Financeira" },
  { nome: "Ronaldson Júnior", email: "comercial@rarotec.com.br", cargo: "Gestor", setor: "Diretoria Comercial" },
  { nome: "Iago Folgado", email: "iago@rarotec.com.br", cargo: "Funcionário", setor: "Recursos Humanos" },
  { nome: "Igor Umeda", email: "igorumeda@rarotec.com", cargo: "Funcionário", setor: "Tecnologia" },
  { nome: "Rodrigo Barbosa", email: "rodrigosouza.souzabarbosa1@gmail.com", cargo: "Funcionário", setor: "Estágio" },
  { nome: "Felipe Falleiros", email: "mendesf84@gmail.com", cargo: "Funcionário", setor: "Estágio" },
]

export async function POST(request: Request) {
  try {
    // Verificar autenticacao
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }
    
    // Verificar se e administrador
    const cargoLower = session.cargo?.toLowerCase() || ""
    if (cargoLower !== "administrador" && cargoLower !== "admin") {
      return NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 })
    }

    const senhaAdmin = "88749860"
    const senhaPadrao = "123456"
    
    const hashAdmin = await bcrypt.hash(senhaAdmin, 10)
    const hashPadrao = await bcrypt.hash(senhaPadrao, 10)
    
    const resultados = {
      usuarios: { criados: 0, existentes: 0, erros: 0 },
      tecnicos: { criados: 0, existentes: 0, erros: 0 }
    }

    for (const usuario of USUARIOS) {
      const senhaHash = usuario.senhaEspecial ? hashAdmin : hashPadrao
      
      try {
        // Verificar se usuario ja existe
        const existeUsuario = await sql`
          SELECT id FROM usuarios WHERE email = ${usuario.email}
        `
        
        if (existeUsuario.length === 0) {
          // Criar usuario
          await sql`
            INSERT INTO usuarios (nome, email, cargo)
            VALUES (${usuario.nome}, ${usuario.email}, ${usuario.cargo})
          `
          resultados.usuarios.criados++
        } else {
          resultados.usuarios.existentes++
        }
      } catch (error) {
        console.error(`Erro ao criar usuario ${usuario.nome}:`, error)
        resultados.usuarios.erros++
      }
      
      try {
        // Verificar se tecnico ja existe
        const existeTecnico = await sql`
          SELECT id FROM tecnicos_rarotec WHERE email = ${usuario.email}
        `
        
        if (existeTecnico.length === 0) {
          // Criar tecnico rarotec
          await sql`
            INSERT INTO tecnicos_rarotec (nome, email, cargos, setores, ativo)
            VALUES (
              ${usuario.nome}, 
              ${usuario.email}, 
              ${[usuario.cargo]}, 
              ${[usuario.setor]}, 
              true
            )
          `
          resultados.tecnicos.criados++
        } else {
          resultados.tecnicos.existentes++
        }
      } catch (error) {
        console.error(`Erro ao criar tecnico ${usuario.nome}:`, error)
        resultados.tecnicos.erros++
      }
    }

    return NextResponse.json({
      success: true,
      message: "Seed concluido",
      resultados
    })
  } catch (error) {
    console.error("Erro ao executar seed:", error)
    return NextResponse.json({ error: "Erro ao executar seed" }, { status: 500 })
  }
}
