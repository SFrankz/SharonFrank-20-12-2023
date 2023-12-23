import { MainComponent } from 'src/app/components/main/main.component';
import { FavoritesComponent } from 'src/app/components/favorites/favorites.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'main/:locationId', component: MainComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
