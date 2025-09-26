import { AbstractControl, ValidationErrors } from '@angular/forms';

export function partitaIvaValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (!value) {
    return null; // campo vuoto -> nessun errore (usa Validators.required se serve obbligatorio)
  }

  // deve contenere solo numeri
  if (!/^\d{11}$/.test(value)) {
    return { partitaIva: 'La Partita IVA deve contenere 11 cifre numeriche' };
  }

  // algoritmo di controllo formale
  let s = 0;
  for (let i = 0; i < 11; i++) {
    let n = parseInt(value.charAt(i), 10);
    if ((i % 2) === 0) {
      s += n;
    } else {
      n = n * 2;
      if (n > 9) n -= 9;
      s += n;
    }
  }

  if (s % 10 !== 0) {
    return { partitaIva: 'Partita IVA non valida' };
  }

  return null; // tutto ok
}
