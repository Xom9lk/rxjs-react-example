import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/skipLast';
import 'rxjs/add/operator/take';
import {Subscription} from 'rxjs/Subscription';
import {DirectionPoint} from '../entities/DirectionPoint';
import {IDirectionPointScheme} from '../schemes/IDirectionPointScheme';
import {PlacesService} from './PlacesService';
import {RouteService} from './RouteService';

describe(RouteService.name, () => {
    let placesService = new PlacesService();
    let routeService = new RouteService(placesService);
    const subscriptions: Subscription[] = [];
    let commonPoints: DirectionPoint[];

    const generateScheme = (id: number): IDirectionPointScheme => {
        return {
            address: `Test address ${id}`,
            location: {
                latitude: id,
                longitude: id
            },
            name: `Test name ${id}`
        }
    };
    beforeEach((done) => {
        placesService = new PlacesService();
        routeService = new RouteService(placesService);
        placesService.addPoints([
            generateScheme(0),
            generateScheme(1),
            generateScheme(2),
            generateScheme(3),
        ]);

        subscriptions.push(placesService.points$.take(1).subscribe((points) => {
            commonPoints = points;
            done();
        }));
    });
    afterEach(() => {
        subscriptions.forEach(sub => sub.unsubscribe());
    });

    it('Добавление пунктов', (done) => {
        subscriptions.push(routeService.createMarkers$.subscribe((points) => {
            expect(points.length).toBe(2);
            expect(points[0].name).toBe('Test name 4');
            expect(points[0].address).toBe('Test address 4');
            expect(points[0].location.latitude).toBe(4);
            expect(points[0].location.longitude).toBe(4);

            expect(points[1].name).toBe('Test name 5');
            expect(points[1].address).toBe('Test address 5');
            expect(points[1].location.latitude).toBe(5);
            expect(points[1].location.longitude).toBe(5);
            done();
        }));
        subscriptions.push(routeService.createLines$.subscribe((lines) => {
            expect(lines.size).toBe(2);
            expect([...lines.keys()][0].name).toBe('Test name 3');
            expect([...lines.keys()][0].address).toBe('Test address 3');
            expect([...lines.keys()][0].location.latitude).toBe(3);
            expect([...lines.keys()][0].location.longitude).toBe(3);

            expect([...lines.values()][0].name).toBe('Test name 4');
            expect([...lines.values()][0].address).toBe('Test address 4');
            expect([...lines.values()][0].location.latitude).toBe(4);
            expect([...lines.values()][0].location.longitude).toBe(4);

            expect([...lines.keys()][1].name).toBe('Test name 4');
            expect([...lines.keys()][1].address).toBe('Test address 4');
            expect([...lines.keys()][1].location.latitude).toBe(4);
            expect([...lines.keys()][1].location.longitude).toBe(4);

            expect([...lines.values()][1].name).toBe('Test name 5');
            expect([...lines.values()][1].address).toBe('Test address 5');
            expect([...lines.values()][1].location.latitude).toBe(5);
            expect([...lines.values()][1].location.longitude).toBe(5);
            done();
        }));
        placesService.addPoints([generateScheme(4), generateScheme(5)]);
    });

    it('Удаление пунктов', (done) => {
        subscriptions.push(routeService.removeMarkers$.subscribe((points) => {
            expect(points.length).toBe(2);
            expect(points[0].name).toBe('Test name 0');
            expect(points[0].address).toBe('Test address 0');
            expect(points[0].location.latitude).toBe(0);
            expect(points[0].location.longitude).toBe(0);

            expect(points[1].name).toBe('Test name 2');
            expect(points[1].address).toBe('Test address 2');
            expect(points[1].location.latitude).toBe(2);
            expect(points[1].location.longitude).toBe(2);
            done();
        }));
        subscriptions.push(routeService.createLines$.subscribe((lines) => {
            expect(lines.size).toBe(1);
            expect([...lines.keys()][0].name).toBe('Test name 1');
            expect([...lines.keys()][0].address).toBe('Test address 1');
            expect([...lines.keys()][0].location.latitude).toBe(1);
            expect([...lines.keys()][0].location.longitude).toBe(1);

            expect([...lines.values()][0].name).toBe('Test name 3');
            expect([...lines.values()][0].address).toBe('Test address 3');
            expect([...lines.values()][0].location.latitude).toBe(3);
            expect([...lines.values()][0].location.longitude).toBe(3);
            done();
        }));
        subscriptions.push(routeService.removeLines$.subscribe((lines) => {
            expect(lines.size).toBe(3);
            expect([...lines.keys()][0].name).toBe('Test name 0');
            expect([...lines.keys()][0].address).toBe('Test address 0');
            expect([...lines.keys()][0].location.latitude).toBe(0);
            expect([...lines.keys()][0].location.longitude).toBe(0);

            expect([...lines.values()][0].name).toBe('Test name 1');
            expect([...lines.values()][0].address).toBe('Test address 1');
            expect([...lines.values()][0].location.latitude).toBe(1);
            expect([...lines.values()][0].location.longitude).toBe(1);

            expect([...lines.keys()][1].name).toBe('Test name 1');
            expect([...lines.keys()][1].address).toBe('Test address 1');
            expect([...lines.keys()][1].location.latitude).toBe(1);
            expect([...lines.keys()][1].location.longitude).toBe(1);

            expect([...lines.values()][1].name).toBe('Test name 2');
            expect([...lines.values()][1].address).toBe('Test address 2');
            expect([...lines.values()][1].location.latitude).toBe(2);
            expect([...lines.values()][1].location.longitude).toBe(2);

            expect([...lines.keys()][2].name).toBe('Test name 2');
            expect([...lines.keys()][2].address).toBe('Test address 2');
            expect([...lines.keys()][2].location.latitude).toBe(2);
            expect([...lines.keys()][2].location.longitude).toBe(2);

            expect([...lines.values()][2].name).toBe('Test name 3');
            expect([...lines.values()][2].address).toBe('Test address 3');
            expect([...lines.values()][2].location.latitude).toBe(3);
            expect([...lines.values()][2].location.longitude).toBe(3);
            done();
        }));
        placesService.removePoints([commonPoints[0], commonPoints[2]]);
    });

    it('Поменять местами', (done) => {
        subscriptions.push(routeService.removeLines$.subscribe((lines) => {
            expect(lines.size).toBe(3);
            expect([...lines.keys()][0].name).toBe('Test name 0');
            expect([...lines.keys()][0].address).toBe('Test address 0');
            expect([...lines.keys()][0].location.latitude).toBe(0);
            expect([...lines.keys()][0].location.longitude).toBe(0);

            expect([...lines.values()][0].name).toBe('Test name 1');
            expect([...lines.values()][0].address).toBe('Test address 1');
            expect([...lines.values()][0].location.latitude).toBe(1);
            expect([...lines.values()][0].location.longitude).toBe(1);

            expect([...lines.keys()][1].name).toBe('Test name 1');
            expect([...lines.keys()][1].address).toBe('Test address 1');
            expect([...lines.keys()][1].location.latitude).toBe(1);
            expect([...lines.keys()][1].location.longitude).toBe(1);

            expect([...lines.values()][1].name).toBe('Test name 2');
            expect([...lines.values()][1].address).toBe('Test address 2');
            expect([...lines.values()][1].location.latitude).toBe(2);
            expect([...lines.values()][1].location.longitude).toBe(2);

            expect([...lines.keys()][2].name).toBe('Test name 2');
            expect([...lines.keys()][2].address).toBe('Test address 2');
            expect([...lines.keys()][2].location.latitude).toBe(2);
            expect([...lines.keys()][2].location.longitude).toBe(2);

            expect([...lines.values()][2].name).toBe('Test name 3');
            expect([...lines.values()][2].address).toBe('Test address 3');
            expect([...lines.values()][2].location.latitude).toBe(3);
            expect([...lines.values()][2].location.longitude).toBe(3);
            done();
        }));

        subscriptions.push(routeService.createLines$.subscribe((lines) => {
            expect(lines.size).toBe(3);
            expect([...lines.keys()][0].name).toBe('Test name 2');
            expect([...lines.keys()][0].address).toBe('Test address 2');
            expect([...lines.keys()][0].location.latitude).toBe(2);
            expect([...lines.keys()][0].location.longitude).toBe(2);

            expect([...lines.values()][0].name).toBe('Test name 1');
            expect([...lines.values()][0].address).toBe('Test address 1');
            expect([...lines.values()][0].location.latitude).toBe(1);
            expect([...lines.values()][0].location.longitude).toBe(1);

            expect([...lines.keys()][1].name).toBe('Test name 1');
            expect([...lines.keys()][1].address).toBe('Test address 1');
            expect([...lines.keys()][1].location.latitude).toBe(1);
            expect([...lines.keys()][1].location.longitude).toBe(1);

            expect([...lines.values()][1].name).toBe('Test name 0');
            expect([...lines.values()][1].address).toBe('Test address 0');
            expect([...lines.values()][1].location.latitude).toBe(0);
            expect([...lines.values()][1].location.longitude).toBe(0);

            expect([...lines.keys()][2].name).toBe('Test name 0');
            expect([...lines.keys()][2].address).toBe('Test address 0');
            expect([...lines.keys()][2].location.latitude).toBe(0);
            expect([...lines.keys()][2].location.longitude).toBe(0);

            expect([...lines.values()][2].name).toBe('Test name 3');
            expect([...lines.values()][2].address).toBe('Test address 3');
            expect([...lines.values()][2].location.latitude).toBe(3);
            expect([...lines.values()][2].location.longitude).toBe(3);
            done();
        }));
        placesService.swap(commonPoints[0].id, commonPoints[2].id);
    });

    it('Изменение пункта', (done) => {
        subscriptions.push(placesService.pointChanged$.subscribe(() => {
            done();
        }));
        placesService.changePoint(commonPoints[3], generateScheme(100));
    });
});