// src/app/services/navigation.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private currentPage: string = '';

  setCurrentPage(page: string) {
    this.currentPage = page;
  }

  isHomePage(): boolean {
    return this.currentPage === 'inicio';
  }
  
}
