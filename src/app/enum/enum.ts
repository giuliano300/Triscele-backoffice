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