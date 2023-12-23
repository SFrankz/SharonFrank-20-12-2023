import { Component, OnInit } from '@angular/core';
import { WeatherService } from 'src/app/services/weather.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  searchQuery: string = '';
  weatherData: any;
  isFavorite: boolean = false;
  temperatureUnit: 'C' | 'F' = 'C';
  isDarkTheme: boolean = false;

  constructor(
    private weatherService: WeatherService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private themeService: ThemeService

  ) {}

  ngOnInit(): void {
    this.themeService.themeChanged.subscribe((isDark) => {
      this.isDarkTheme = isDark;
    });

    this.route.queryParams.subscribe((params) => {
      const locationId = params['locationId'];
      if (locationId) {
        this.searchCityById(locationId);
      } else {
        this.searchCity('Tel Aviv');
      }
    });

  }


  getTemperature(value: number): number {
    return this.temperatureUnit === 'C' ? value : (value * 9) / 5 + 32;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }



  getDayName(date: string | null): string {
    if (!date) {
      return '';
    }

    const formattedDate = new Date(date);
    return this.datePipe.transform(formattedDate, 'EEEE') || '';
  }

  searchCity(city: string): void {
    if (!/^[a-zA-Z\s]+$/.test(city)) {
      alert('Invalid search query. Please use English letters only.');
      return;
    }
    this.weatherService.getLocationAutocomplete(city).subscribe((locations) => {
      if (locations && locations.length > 0) {
        const locationKey = locations[0].Key;

        this.weatherService.getCurrentWeather(locationKey).subscribe((currentWeather) => {
          this.weatherService.get5DayForecast(locationKey).subscribe((forecast) => {
            this.weatherData = {
              location: { name: locations[0].LocalizedName, key: locationKey },
              currentWeather: currentWeather[0]?.Temperature?.Metric,
              forecast: forecast.DailyForecasts,
            };
            this.isFavorite = this.weatherService.isFavorite(locationKey);
          });
        });
      }
    });
  }

  searchCityById(locationId: string): void {
    this.weatherService.getLocationDetails(locationId).subscribe((locationDetails) => {
      const locationName = locationDetails.LocalizedName;
      this.weatherService.getCurrentWeather(locationId).subscribe((currentWeather) => {
        this.weatherService.get5DayForecast(locationId).subscribe((forecast) => {
          this.weatherData = {
            location: { name: locationName, key: locationId },
            currentWeather: currentWeather[0]?.Temperature?.Metric,
            forecast: forecast.DailyForecasts,
          };
          this.isFavorite = this.weatherService.isFavorite(locationId);
        });
      });
    });
  }

  toggleFavorite(): void {
    const locationKey = this.weatherData.location.key;

    if (this.weatherService.isFavorite(locationKey)) {
      alert('This city is already in your favorites.');
    } else {
      this.weatherService.addFavorite(locationKey, this.weatherData.location.name);
      alert('Added');
    }
    this.isFavorite = this.weatherService.isFavorite(locationKey);
  }
}
