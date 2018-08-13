import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as sinon from 'sinon';
import {ioc} from '../ioc';
import {MapService} from '../services/abstract/MapService';
import {GoogleSearchPlaceService} from '../services/GoogleSearchPlaceService';
import {App} from './App';

beforeAll(() => {
    const mapService = ioc.get(MapService);
    const googleSearchPlaceService = ioc.get(GoogleSearchPlaceService);
    sinon.replace(mapService, 'destroy', sinon.fake());
    sinon.replace(mapService, 'initMap', sinon.fake());
    sinon.replace(googleSearchPlaceService, 'destroy', sinon.fake());
    sinon.replace(googleSearchPlaceService, 'init', sinon.fake());
});

afterAll( () => {
    const mapService = ioc.get(MapService);
    const googleSearchPlaceService = ioc.get(GoogleSearchPlaceService);
    (mapService.destroy as any).restore();
    (mapService.initMap as any).restore();
    (googleSearchPlaceService.destroy as any).restore();
    (googleSearchPlaceService.init as any).restore();
});

describe(App.name, () => {
    it('Рендер', () => {
        const div = document.createElement('div');
        ReactDOM.render(<App />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
