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

export enum FieldTypes {
  select = 1,
  selectMultiple, 
  date,
  color,
  checkbox, 
  radio,
  text,
  texarea
}


export const FieldTypesLabels: Record<keyof typeof FieldTypes, string> = {
  select: 'Select',
  selectMultiple: 'Select Multipla',
  date: 'Campo data',
  color: ' Campo colore',
  checkbox: 'Checkbox(Selezione multipla)',
  radio: 'Radio button(Selezione singola)',
  text: 'Campo di testo',
  texarea: 'Area di testo'
};

export enum ConditionalLogic{
  depends = 1,
  notDepends
}

export const ConditionalLogicLabels: Record<keyof typeof ConditionalLogic, string> = {
  depends: 'Dipende da',
  notDepends: 'Indipendente'
};