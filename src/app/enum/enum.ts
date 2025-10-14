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

export const AGENTS: AgentOption[] = [
  { id: 1,  value: "Tanino", label: "Tanino" },
  { id: 2, value: "Salvo Marchese", label: "Salvo Marchese" },
  { id: 3,  value: "Piero De Blasi", label: "Piero De Blasi" },
  { id: 4,  value: "privato", label: "privato" },
  { id: 5,  value: "Rosario Siragusa", label: "Rosario Siragusa" },
  { id: 6,  value: "Michele Foti", label: "Michele Foti" },
  { id: 7,  value: "Triscele", label: "Triscele" },
  { id: 8,  value: "Online", label: "Online" },
  { id: 9,  value: "Giuseppe Ciulla", label: "Giuseppe Ciulla" },
  { id: 10,  value: "Giorgia Bellafiore", label: "Giorgia Bellafiore" }
];

export const MovementType: any[] = [
  { id: 1, name: "Carico" },
  { id: 2, name: "Scarico" }
]