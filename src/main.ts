import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';

// Definisci l'URL globale dell'API
export const API_URL = 'https://backend.plumadev.com/';
export const TOKEN_KEY = 'a-string-secret-at-least-256-bits-long';
export const exceedsLimit = 3;
export const maxLenghtUploadFile = 10;
export const clause = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideToastr(), 
    provideHttpClient(),
    provideAuth(() => getAuth())
  ]
}).catch(err => console.error(err));


export function generateOptionText(option: any): string[] {
  let texts: string[] = [];

  // Se l'opzione è un array, eseguiamo una chiamata ricorsiva
  if (Array.isArray(option)) {
    option.forEach(opt => {
      texts = texts.concat(generateOptionText(opt)); // Ricorsiva
    });
  } else {
    // Se l'opzione ha un prodotto selezionato, lo aggiungiamo
    if (option.selectedProduct) {
      const sp = option.selectedProduct;
      if (sp) {
        texts.push(`• ${sp.name} (x${sp.qta || 1}) - €${sp.price.toFixed(2)}`);
      }
    }

    // Se l'opzione ha delle "children", le gestiamo ricorsivamente
    if (option.children && Array.isArray(option.children) && option.children.length > 0) {
      option.children.forEach((child: any) => {
        // Aggiungiamo un livello di indentazione per le children
        const childTexts = generateOptionText(child);  // Ricorsiva
        texts = texts.concat(childTexts.map(text => `  ${text}`)); // Aggiungi l'indentazione
      });
    }
  }

  return texts;
}

export  function calculateFinalPrice(basePrice: number, quantity: number, discount: number, selectedOptions: any[] = []): number {
  const optionsPrice = sumSelectedOptionsPrice(selectedOptions);
  return (basePrice + optionsPrice) * quantity - discount;
}

export function sumSelectedOptionsPrice(selectedOptions: any[]): number {
  if(!selectedOptions) return 0;
  let total = 0;
  const sum = (options: any[]) => {
    for (const opt of options) {
      if (!Array.isArray(opt)) {
        //console.warn("Attenzione: opt non è un array:", opt);
        continue; // passa al prossimo elemento
      }

      for (const o of opt) {
        if (o.selectedProduct?.price) {
          total += o.selectedProduct.price * o.selectedProduct.qta;
        }

        if (o.children && Array.isArray(o.children) && o.children.length > 0) {
          sum(o.children); // ricorsione
        }
      }
    }
  };
  sum(selectedOptions);
  return total;
}
