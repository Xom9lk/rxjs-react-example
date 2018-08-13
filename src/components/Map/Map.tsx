import * as React from 'react';
import {Subscription} from 'rxjs/Subscription';
/* tslint:disable:ordered-imports */
import 'rxjs/add/operator/mergeMap';
import {locationToLatLng} from '../../common/locationConverter';
import {DirectionPoint} from '../../entities/DirectionPoint';
import {IDirectionPointScheme} from '../../schemes/IDirectionPointScheme';
import {GoogleSearchPlaceService, TGooglePlacesSearchEventHandler} from '../../services/GoogleSearchPlaceService';
import {SearchBox} from '../SearchBox/SearchBox';
import * as s from './Map.css';
import {ioc} from '../../ioc';
import {MapService} from '../../services/abstract/MapService';
import {IChangeLinesEvent, RouteService} from '../../services/RouteService';
import {PlacesService} from '../../services/PlacesService';

interface IProps {}
interface IState {}

export class Map extends React.PureComponent<IProps, IState> {
    private readonly mapContainer: React.RefObject<HTMLDivElement>;
    private readonly search: React.RefObject<SearchBox>;

    private subscriptions: Subscription[] = [];

    private mapService: MapService;
    private googleSearchPlaceService: GoogleSearchPlaceService;
    private routeService: RouteService;
    private placesService: PlacesService;

    constructor(props: IProps) {
        super(props);
        this.mapContainer = React.createRef();
        this.search = React.createRef();
    }

    public componentDidMount() {
        this.mapService = ioc.get(MapService);
        this.googleSearchPlaceService = ioc.get(GoogleSearchPlaceService);
        this.routeService = ioc.get(RouteService);
        this.placesService = ioc.get(PlacesService);

        this.mapService.initMap(this.mapContainer.current!);
        this.googleSearchPlaceService.init(this.search.current!.input.current!);

        this.subscriptions.push(this.routeService.createMarkers$.subscribe(this.mapService.addMarkers));
        this.subscriptions.push(this.routeService.removeMarkers$.subscribe(this.mapService.removeMarkers));

        this.subscriptions.push(this.routeService.changeLines$.subscribe(this.changeLines));
        this.subscriptions.push(this.googleSearchPlaceService.searchResult$.subscribe(this.searchHandler));
        this.subscriptions.push(this.googleSearchPlaceService.searchResult$.subscribe(this.recenter));
        this.subscriptions.push(this.mapService.changePointPosition$
            .mergeMap(e => this.googleSearchPlaceService.findByLocation(e.location), (e, scheme) => ({
                newData: scheme,
                point: e.point,
            }))
            .subscribe(this.changePosition));
    }

    public componentWillUnmount() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.googleSearchPlaceService.destroy();
        this.mapService.destroy();
    }

    /* tslint:disable: jsx-self-close */
    public render() {
        return (
            <div className={s.container}>
                <div className={s.map} ref={this.mapContainer}></div>
                <div className={s.searchBox}>
                    <SearchBox ref={this.search} />
                </div>
            </div>
        );
    }

    private changeLines = (changes: IChangeLinesEvent):void => {
        this.mapService.removeLines(changes.remove);
        this.mapService.addLines(changes.create);
    };

    private searchHandler: TGooglePlacesSearchEventHandler = (place) => this.placesService.addPoints([place]);
    private recenter = (place: IDirectionPointScheme) => this.mapService.panTo(locationToLatLng(place.location));
    private changePosition = ({point, newData}: {point: DirectionPoint, newData: IDirectionPointScheme}) =>
        this.placesService.changePoint(point, newData);
}
