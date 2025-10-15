export enum OrderStatus {
  COMPLETATO = 1,
  IN_LAVORAZIONE = 2,
  RIMBORSATO = 3,
  IN_SOSPESO = 4,
  CANCELLATO = 5,
  FALLITO = 6,
  SPEDITO = 10,
  PREVENTIVO = 11,
  CONSEGNATO = 14,
  COMPLETATO_DUPLICATO = 15,
  IN_CONSEGNA = 16,
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