import {locationToLatLng} from '../common/locationConverter';
import {DirectionPoint} from './DirectionPoint';

export class MyMaker {
    protected readonly mvc: google.maps.Marker;
    protected readonly listeners: google.maps.MapsEventListener[] = [];
    constructor(
        protected point: DirectionPoint,
        protected map: google.maps.Map,
        protected changePositionCallback: (point: DirectionPoint, position: google.maps.LatLng) => void,
        protected clickCallback: (point: DirectionPoint, marker: google.maps.Marker) => void) {
        this.mvc = new google.maps.Marker({
            draggable: true,
            map: this.map,
            position: locationToLatLng(this.point.location),
            title: this.point.address
        });

        this.listeners.push(this.mvc.addListener('dragend', this.onDragend));
        this.listeners.push(this.mvc.addListener('click', this.onClick));
    }

    public remove() {
        this.listeners.forEach(l => l.remove());
        this.mvc.unbindAll();
        this.mvc.setMap(null);
    }

    public getMarker(): google.maps.Marker {
        return this.mvc;
    }

    protected onDragend = (e: google.maps.MouseEvent) => this.changePositionCallback(this.point, e.latLng);
    protected onClick = (e: google.maps.MouseEvent) => this.clickCallback(this.point, this.mvc);
}