import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey = environment.apiKey;
  private baseUrl = '/api/';
  private favorites: any[] = [];
  private cacheKeyPrefix = 'weather-api-cache-';

  constructor(private http: HttpClient) {}

  private fetchData(url: string, params: HttpParams): Observable<any> {
    const cacheKey = this.cacheKeyPrefix + url + params.toString();
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      return of(JSON.parse(cachedData) || null);
    } else {
      return this.http.get<any>(url, { params }).pipe(
        catchError((error) => {
          console.error('API Error:', error);
          return of(null);
        })
      );
    }
  }

  private cacheData(url: string, params: HttpParams, data: any): void {
    const cacheKey = this.cacheKeyPrefix + url + params.toString();
    localStorage.setItem(cacheKey, JSON.stringify(data));
  }

  getLocationAutocomplete(query: string): Observable<any[]> {
    const url = `${this.baseUrl}locations/v1/cities/autocomplete`;
    const params = new HttpParams().set('apikey', this.apiKey).set('q', query);
    return this.fetchData(url, params);
  }

  getCurrentWeather(locationKey: string): Observable<any> {
    const url = `${this.baseUrl}currentconditions/v1/${locationKey}`;
    const params = new HttpParams().set('apikey', this.apiKey);
    return this.fetchData(url, params);
  }

  get5DayForecast(locationKey: string): Observable<any> {
    const url = `${this.baseUrl}forecasts/v1/daily/5day/${locationKey}`;
    const params = new HttpParams().set('apikey', this.apiKey);
    return this.fetchData(url, params);
  }

  isFavorite(locationKey: string): boolean {
    return this.favorites.some((favorite) => favorite.id === locationKey);
  }

  addFavorite(locationKey: string, locationName: string): void {
    const newFavorite = {
      id: locationKey,
      name: locationName,
      currentWeather: {},
    };
    this.favorites.push(newFavorite);
    this.cacheData('favorites', new HttpParams(), this.favorites);
  }

  removeFavorite(locationKey: string): any[] {
    this.favorites = this.favorites.filter(
      (favorite) => favorite.id !== locationKey
    );
    this.cacheData('favorites', new HttpParams(), this.favorites);
    return this.favorites;
  }
  getFavorites(): any[] {
    return this.favorites;
  }

  getLocationKey(locationName: string): string {
    const favorite = this.favorites.find((f) => f.name === locationName);
    return favorite ? favorite.id : '';
  }

  getCurrentWeatherAndForecast(locationKey: string): Observable<any> {
    const currentWeather$ = this.getCurrentWeather(locationKey);
    const forecast$ = this.get5DayForecast(locationKey);

    return forkJoin([currentWeather$, forecast$]).pipe(
      map(([currentWeather, forecast]) => {
        return {
          currentWeather: currentWeather[0]?.Temperature?.Metric,
          forecast: forecast.DailyForecasts,
        };
      })
    );
  }
  getCurrentWeatherForFavorites(): Observable<any[]> {
    this.favorites = this.retrieveData('favorites') || [];

    const locationObservables = this.favorites.map((favorite) =>
      this.getCurrentWeatherAndForecast(favorite.id).pipe(
        map((data) => ({
          ...favorite,
          currentWeather: data.currentWeather,
          forecast: data.forecast,
        })),
        catchError(() =>
          of({ ...favorite, currentWeather: null, forecast: null })
        )
      )
    );

    return forkJoin(locationObservables);
  }

  private retrieveData(key: string): any {
    const cacheKey = this.cacheKeyPrefix + key;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  }

  getLocationDetails(locationKey: string): Observable<any> {
    const url = `${this.baseUrl}locations/v1/cities/${locationKey}`;
    const params = new HttpParams().set('apikey', this.apiKey);
    return this.fetchData(url, params);
  }
  private handleError(error: any): Observable<any> {
    console.error('API Error:', error);
    if (error instanceof HttpErrorResponse) {
      console.error('Status:', error.status);
      console.error('Status Text:', error.statusText);
    }

    return of(null);
  }
}
