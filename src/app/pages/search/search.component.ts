import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators';

import { Place, SearchParams } from '../../interfaces';
import { PlacesService } from '../../services/places.service';
import { WishlistService } from '../../services/wishlist.service';
import { PlaceCardComponent } from '../../components/place-card/place-card.component';
import { PlaceDetailComponent } from '../../components/place-detail/place-detail.component';

/** Стан реактивного пошукового потоку. */
type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; places: Place[] }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, PlaceCardComponent, PlaceDetailComponent],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  private readonly placesService = inject(PlacesService);
  readonly wishlist = inject(WishlistService);

  near = '';

  readonly filterTerm = signal('');

  private readonly searchTrigger$ = new Subject<SearchParams>();

  readonly fromCache = this.placesService.servedFromCache;
  readonly cacheSeconds = signal(0);
  readonly selected = signal<Place | null>(null);
  private readonly validationError = signal<string | null>(null);

  readonly examples = ['Київ', 'Львів', 'Париж'];

  private readonly state = toSignal(
    this.searchTrigger$.pipe(
      switchMap((params) =>
        this.placesService.search(params).pipe(
          tap(() => this.cacheSeconds.set(this.placesService.cacheRemainingSeconds(params))),
          map((places): SearchState => ({ status: 'loaded', places })),
          startWith<SearchState>({ status: 'loading' }),
          catchError(() =>
            of<SearchState>({
              status: 'error',
              message: 'Не вдалося завантажити місця. Спробуйте ще раз.',
            }),
          ),
        ),
      ),
    ),
    { initialValue: { status: 'idle' } as SearchState },
  );

  readonly loading = computed(() => this.state().status === 'loading');
  readonly searched = computed(() => this.state().status !== 'idle');
  
  readonly results = computed<Place[]>(() => {
    const s = this.state();
    return s.status === 'loaded' ? s.places : [];
  });
  
  readonly displayedResults = computed<Place[]>(() => {
    const term = this.filterTerm().trim().toLowerCase();
    const all = this.results();
    if (!term) {
      return all;
    }
    return all.filter((p) => p.name.toLowerCase().includes(term));
  });
  
  readonly canFilter = computed(() => this.results().length > 0);
  readonly error = computed<string | null>(() => {
    const s = this.state();
    return s.status === 'error' ? s.message : this.validationError();
  });

  search(): void {
    if (!this.near.trim()) {
      this.validationError.set('Вкажіть місто або геолокацію для пошуку.');
      return;
    }
    this.validationError.set(null);
    
    this.filterTerm.set('');
    
    this.searchTrigger$.next({ query: '', near: this.near });
  }

  quickSearch(city: string): void {
    this.near = city;
    this.search();
  }

  onToggleSave(place: Place): void {
    this.wishlist.toggle(place);
  }

  openDetails(place: Place): void {
    this.selected.set(place);
  }

  closeDetails(): void {
    this.selected.set(null);
  }

  isSaved(id: string): boolean {
    return this.wishlist.isSaved(id);
  }
}
