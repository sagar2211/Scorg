import { Theme, primary, secondary, warning, info, success, danger, pink, light, dark, alternate } from './theme';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ThemeService {
  public active: Theme = primary;

  setSelectedTheme(themeSelected): void {
    if (themeSelected === 'primary') {
      this.setActiveTheme(primary);
    } else if (themeSelected === 'secondary') {
      this.setActiveTheme(secondary);
    } else if (themeSelected === 'success') {
      this.setActiveTheme(success);
    } else if (themeSelected === 'warning') {
      this.setActiveTheme(warning);
    } else if (themeSelected === 'info') {
      this.setActiveTheme(info);
    } else if (themeSelected === 'danger') {
      this.setActiveTheme(danger);
    } else if (themeSelected === 'pink') {
      this.setActiveTheme(pink);
    } else if (themeSelected === 'light') {
      this.setActiveTheme(light);
    } else if (themeSelected === 'dark') {
      this.setActiveTheme(dark);
    } else if (themeSelected === 'alternate') {
      this.setActiveTheme(alternate);
    }
  }

  setActiveTheme(theme: Theme): void {
    this.active = theme;

    Object.keys(this.active.properties).forEach(property => {
      document.documentElement.style.setProperty(
        property,
        this.active.properties[property]
      );
    });
  }
}
