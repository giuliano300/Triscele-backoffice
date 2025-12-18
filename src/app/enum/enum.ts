export enum OrderStatus {
  IN_LAVORAZIONE = "68f0b268bb5ad4f8f63c0630" // Non eliminabile
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  CONTANTI = 'cash',
  POS = 'pos'
}

export interface AgentOption {
  id: number;
  value: string;
  label: string;
}

export const MovementType: any[] = [
  { id: 1, name: "Carico" },
  { id: 2, name: "Scarico" }
]

export enum OptionType{
  select = 1,
  text,
  textarea,
  date,
  color
}

export const OptionTypeLabels: Record<keyof typeof OptionType, string> = {
  select: 'Select',
  date: 'Campo data',
  color: ' Campo colore',
  text: 'Campo di testo',
  textarea: 'Area di testo'
};

export enum ConditionalLogic{
  depends = 1,
  notDepends
}

export const ConditionalLogicLabels: Record<keyof typeof ConditionalLogic, string> = {
  depends: 'Dipende da',
  notDepends: 'Indipendente'
};

export enum absenceType{
  ferie = 1, 
  permesso = 2
}

export enum LoginType {
  homeWork = 'Home work',
  onSite = 'In sede',
}