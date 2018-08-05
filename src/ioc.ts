import {Container} from 'inversify';
import 'reflect-metadata';
import {MapService} from './services/abstract/MapService';
import {GoogleMapService} from './services/GoogleMapService';
import {GoogleSearchPlaceService} from './services/GoogleSearchPlaceService';
import {PlacesService} from './services/PlacesService';
import {RouteService} from './services/RouteService';

export const ioc = new Container();
const mapService: GoogleMapService = new GoogleMapService();
ioc.bind(MapService).toConstantValue(mapService);
ioc.bind(GoogleMapService).toConstantValue(mapService);
ioc.bind(GoogleSearchPlaceService).toSelf().inSingletonScope();
ioc.bind(PlacesService).toSelf().inSingletonScope();
ioc.bind(RouteService).toSelf().inSingletonScope();
