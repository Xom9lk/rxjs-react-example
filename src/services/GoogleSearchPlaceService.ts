import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
/* tslint:disable:ordered-imports */
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/do';
import {latLngToLocation, locationToLatLng} from '../common/locationConverter';
import {DirectionPoint} from '../entities/DirectionPoint';
import {IDirectionPointScheme} from '../schemes/IDirectionPointScheme';
import {GoogleMapService} from './GoogleMapService';
import {inject, injectable} from 'inversify';

export type TGooglePlacesSearchEventHandler = (point: DirectionPoint) => void;

@injectable()
export class GoogleSearchPlaceService {
    public readonly searchResult$: Observable<IDirectionPointScheme>;

    protected map: google.maps.Map;
    protected placeChangedListener: google.maps.MapsEventListener;
    protected autocomplete: google.maps.places.Autocomplete;
    protected geocoder: google.maps.Geocoder;
    protected readonly searchResultSubject: Subject<IDirectionPointScheme> = new Subject();

    constructor(@inject(GoogleMapService) protected mapService: GoogleMapService) {
        this.searchResult$ = this.searchResultSubject.asObservable()
            .do((place) => console.info(`[${GoogleSearchPlaceService.name}] Найден пункт назначения`, place))
            .share();
    }

    public init(input: HTMLInputElement): void {
        this.map = this.mapService.getMap();
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        this.geocoder = new google.maps.Geocoder();

        this.autocomplete = new google.maps.places.Autocomplete(input);
        this.autocomplete.bindTo('bounds', this.map);

        this.placeChangedListener = this.autocomplete.addListener('place_changed', () => {
            const place = this.autocomplete.getPlace();
            if (!place.geometry) {
                console.warn('Найден пункт без координат');
                return;
            }

            this.searchResultSubject.next({
                address: place.formatted_address,
                location: latLngToLocation(place.geometry.location),
                name: place.name,
            });
        });
    }

    public destroy() {
        this.autocomplete.unbindAll();
        this.placeChangedListener.remove();
    }

    public findByLocation(location: {latitude: number; longitude: number}): Promise<IDirectionPointScheme> {
        return new Promise((resolve) => {
            this.geocoder.geocode({location: locationToLatLng(location)}, ((results, status) => {
                const place = {
                    address: `${location.latitude}, ${location.longitude}`,
                    location,
                    name: ''
                };
                if (status === google.maps.GeocoderStatus.OK) {
                    place.address = results[0].formatted_address;
                }
                resolve(place);
            }))
        });
    }
}