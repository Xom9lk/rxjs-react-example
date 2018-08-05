export class MyPolyline {
    protected polyline: google.maps.Polyline;
    protected listeners: google.maps.MapsEventListener[] = [];

    constructor(
        protected markerLeft: google.maps.Marker,
        protected markerRight: google.maps.Marker,
        protected map: google.maps.Map
    ) {
        this.polyline = new google.maps.Polyline({
            map: this.map,
            path: [markerLeft.getPosition(), markerRight.getPosition()],
            strokeColor: '#c73b35',
            strokeOpacity: 1.0,
            strokeWeight: 3,
        });

        this.listeners.push(this.markerLeft.addListener('drag', this.leftMarkerChangePosition));
        this.listeners.push(this.markerLeft.addListener('onDragend', this.leftMarkerChangePosition));

        this.listeners.push(this.markerRight.addListener('drag', this.rightMarkerChangePosition));
        this.listeners.push(this.markerRight.addListener('onDragend', this.rightMarkerChangePosition));
    }

    public remove() {
        this.listeners.forEach(l => l.remove());
        this.polyline.unbindAll();
        this.polyline.setMap(null);
    }

    protected leftMarkerChangePosition = (e: google.maps.MouseEvent) =>
        this.polyline.setPath([e.latLng, this.markerRight.getPosition()]);

    protected rightMarkerChangePosition = (e: google.maps.MouseEvent) =>
        this.polyline.setPath([this.markerLeft.getPosition(), e.latLng]);
}