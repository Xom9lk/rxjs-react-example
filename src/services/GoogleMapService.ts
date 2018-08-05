import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
/* tslint:disable:ordered-imports */
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/do';
import {latLngToLocation} from '../common/locationConverter';
import {DirectionPoint} from '../entities/DirectionPoint';
import {MyMaker} from '../entities/Maker';
import {MyPolyline} from '../entities/Polyline';
import {IChangePositionEvent, MapService} from './abstract/MapService';
import {injectable} from 'inversify';

@injectable()
export class GoogleMapService extends MapService {
    public readonly changePointPosition$: Observable<IChangePositionEvent>;
    
    protected readonly changePointPositionSubject: Subject<IChangePositionEvent> = new Subject();
    protected map: google.maps.Map;
    protected markers: Map<DirectionPoint, MyMaker> = new Map();
    protected lines: Map<DirectionPoint, MyPolyline> = new Map();
    protected infoWindow: google.maps.InfoWindow;
    
    constructor() {
        super();
        this.changePointPosition$ = this.changePointPositionSubject.asObservable()
            .do(e => console.info(`[${GoogleMapService.name}] изменена позиция маркера`, e))
            .share();
    }

    public initMap(container: HTMLDivElement): void {
        this.map = new google.maps.Map(container, {
            center: {lat: 56.8389261, lng: 60.6057025},
            zoom: 13
        });

        this.infoWindow = new google.maps.InfoWindow({
            content: '',
            maxWidth: 200,
        });
    }
    public destroy(): void {
        this.infoWindow.close();
        this.lines.forEach(value => value.remove());
        this.markers.forEach(value => value.remove());
        this.map.unbindAll();
    }

    public getMap(): google.maps.Map {
        return this.map;
    }

    public addMarkers = (points: DirectionPoint[]) => {
        points.forEach((p) =>
            this.markers.set(p, new MyMaker(p, this.map, this.changePositionCallback, this.clickOnMarkerCallback)));
    };

    public removeMarkers = (points: DirectionPoint[]) => {
        points.forEach((p) => {
            const marker = this.markers.get(p);
            if (marker) {
                marker.remove();
            }
            this.markers.delete(p);
        });
    };

    public addLines = (lines: Map<DirectionPoint, DirectionPoint>) => {
        [...lines.keys()].forEach((p) => {
            const firstMarker = this.markers.get(p)!;
            const secondMarker = this.markers.get(lines.get(p)!)!;
            if (!firstMarker || !secondMarker) {
                throw Error(GoogleMapService.name + ' Произошла ошибка, нет маркеров для привязка к линиям');
            }
            this.lines.set(p, new MyPolyline(firstMarker.getMarker(), secondMarker.getMarker(), this.map));
        });
    };

    public removeLines = (lines: Map<DirectionPoint, DirectionPoint>) => {
        [...lines.keys()]
            .filter(p => this.lines.has(p))
            .forEach((p) => this.lines.get(p)!.remove());
    };

    public panTo(latLng: { lat: number; lng: number }): void {
        this.map.panTo(latLng);
    }

    protected changePositionCallback = (point: DirectionPoint, position: google.maps.LatLng) => {
        this.infoWindow.close();
        this.changePointPositionSubject.next({point, location: latLngToLocation(position)});
    };

    protected clickOnMarkerCallback = (point: DirectionPoint, marker: google.maps.Marker) => {
        this.infoWindow.close();
        this.infoWindow.setContent(`${point.name} ${point.address}`.trim());
        this.infoWindow.open(this.map, marker);
    }
}