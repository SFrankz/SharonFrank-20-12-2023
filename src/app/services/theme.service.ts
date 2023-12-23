
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkTheme: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  get themeChanged() {
    return this.isDarkTheme.asObservable();
  }

  toggleTheme(): void {
    this.isDarkTheme.next(!this.isDarkTheme.value);
    this.applyTheme();
  }

  isDark(): boolean {
    return this.isDarkTheme.value;
  }

  private applyTheme(): void {
    document.body.classList.toggle('dark-theme', this.isDarkTheme.value);
  }
}
