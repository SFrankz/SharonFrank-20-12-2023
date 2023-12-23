
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WeatherService } from 'src/app/services/weather.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
})
export class FavoritesComponent implements OnInit {
  favorites: any[] = [];
  temperatureUnit: 'C' | 'F' = 'C';

  constructor(
    public weatherService: WeatherService,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.refreshFavorites();
  }

  refreshFavorites(): void {
    this.weatherService
      .getCurrentWeatherForFavorites()
      .subscribe((favorites) => {
        this.favorites = favorites;
      });
  }

  navigateToDetails(locationId: string): void {
    this.router.navigate(['/main', locationId]);
  }
  removeFromFavorites(locationId: string): void {
    const updatedFavorites = this.weatherService.removeFavorite(locationId);
    this.favorites = updatedFavorites;
    alert('Removed');
  }

  getTemperature(value: number): number {
    return this.temperatureUnit === 'C' ? value : (value * 9) / 5 + 32;
  }

  getDayName(date: string | null): string {
    if (!date) {
      return '';
    }

    const formattedDate = new Date(date);
    return this.datePipe.transform(formattedDate, 'EEEE') || '';
  }
}
