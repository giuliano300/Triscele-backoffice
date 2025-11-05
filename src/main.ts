import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';

// Definisci l'URL globale dell'API
export const API_URL = 'https://api-demo.ewtlab.it/';
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
