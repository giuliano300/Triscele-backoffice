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
  const lines: string[] = [];

  if (!option) return lines;

  const optionName = option.name ?? '';

  // 🔵 SELECT
  if (option.selectedProduct) {
    const p = option.selectedProduct;
    const qta = p.qta ?? 1;

    lines.push(`- ${optionName}:${qta} x ${p.name} (${p.price}€)`);
  }

  // 🟢 MULTIPRODUCT
  if (Array.isArray(option.selectedProducts) && option.selectedProducts.length > 0) {
    lines.push(`- ${optionName}:`);

    option.selectedProducts.forEach((p: any) => {
      const qta = p.qta ?? 1;
      lines.push(`${qta} x ${p.name} (${p.price}€)`);
    });
  }

  // 🟡 FIGLI
  if (Array.isArray(option.children) && option.children.length > 0) {
    option.children.forEach((child: any) => {
      lines.push(...generateOptionText(child));
    });
  }

  return lines;
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

export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0')
  );
}
