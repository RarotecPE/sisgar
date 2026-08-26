"use client"

import { Input } from "@/components/ui/input"
import { maskCPF, maskCNPJ, maskPhone, maskCelular, maskCEP, maskCurrency } from "@/lib/masks"

type MaskType = "cpf" | "cnpj" | "phone" | "telefone" | "celular" | "cep" | "currency"

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  mask: MaskType
  value: string
  onChange: (value: string) => void
}

const maskFunctions: Record<MaskType, (value: string) => string> = {
  cpf: maskCPF,
  cnpj: maskCNPJ,
  phone: maskPhone,
  telefone: maskPhone,
  celular: maskCelular,
  cep: maskCEP,
  currency: maskCurrency,
}

export function MaskedInput({ mask, value, onChange, ...props }: MaskedInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = maskFunctions[mask](e.target.value)
    onChange(maskedValue)
  }

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
    />
  )
}
