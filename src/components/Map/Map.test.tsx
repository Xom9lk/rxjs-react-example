import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as sinon from 'sinon';
import {SinonSpy} from 'sinon';
import {ioc} from '../../ioc';
import {MapService} from '../../services/abstract/MapService';
import {GoogleSearchPlaceService} from '../../services/GoogleSearchPlaceService';
import {Map} from './Map';

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
    (mapService.destroy as SinonSpy).restore();
    (mapService.initMap as SinonSpy).restore();
    (googleSearchPlaceService.destroy as SinonSpy).restore();
    (googleSearchPlaceService.init as SinonSpy).restore();
});

describe(Map.name, () => {
    it('Рендер', () => {
        const mapService = ioc.get(MapService);
        const googleSearchPlaceService = ioc.get(GoogleSearchPlaceService);

        const div = document.createElement('div');
        ReactDOM.render(<Map />, div);

        expect((mapService.initMap as SinonSpy).calledOnce).toBeTruthy();
        expect((googleSearchPlaceService.init as SinonSpy).calledOnce).toBeTruthy();

        ReactDOM.unmountComponentAtNode(div);

        expect((mapService.destroy as SinonSpy).calledOnce).toBeTruthy();
        expect((googleSearchPlaceService.destroy as SinonSpy).calledOnce).toBeTruthy();
    });
});
