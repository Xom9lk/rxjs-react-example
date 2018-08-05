import {injectable} from 'inversify';
import {Observable} from 'rxjs/Observable';
import {DirectionPoint} from '../../entities/DirectionPoint';

export interface IChangePositionEvent {
    point: DirectionPoint;
    location: {
        latitude: number;
        longitude: number
    }
}

@injectable()
export abstract class MapService {
    public abstract changePointPosition$: Observable<IChangePositionEvent>;
    
    public abstract initMap(container: HTMLDivElement): void;

    public abstract destroy(): void;
    public abstract addMarkers(points: DirectionPoint[]): void;
    public abstract removeMarkers(points: DirectionPoint[]): void;
    public abstract addLines(lines: Map<DirectionPoint, DirectionPoint>): void;
    public abstract removeLines(lines: Map<DirectionPoint, DirectionPoint>): void;
    public abstract panTo(latLng: {lat: number, lng: number}): void;
}
