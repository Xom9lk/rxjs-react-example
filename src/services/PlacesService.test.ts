import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/skipLast';
import 'rxjs/add/operator/take';
import {Subscription} from 'rxjs/Subscription';
import {DirectionPoint} from '../entities/DirectionPoint';
import {IDirectionPointScheme} from '../schemes/IDirectionPointScheme';
import {PlacesService} from './PlacesService';

describe(PlacesService.name, () => {
    let placesService = new PlacesService();
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
        placesService.addPoints([generateScheme(4), generateScheme(5)]);
        subscriptions.push(placesService.points$.subscribe((points) => {
            expect(points.length).toBe(6);
            expect(points[4].name).toBe('Test name 4');
            expect(points[4].address).toBe('Test address 4');
            expect(points[4].location.latitude).toBe(4);
            expect(points[4].location.longitude).toBe(4);
            done();
        }));
    });

    it('Удаление пунктов', (done) => {
        placesService.removePoints([commonPoints[0], commonPoints[3]]);
        subscriptions.push(placesService.points$.subscribe((points) => {
            expect(points.length).toBe(2);
            expect(points[0].name).toBe('Test name 1');
            expect(points[0].address).toBe('Test address 1');
            expect(points[0].location.latitude).toBe(1);
            expect(points[0].location.longitude).toBe(1);

            expect(points[1].name).toBe('Test name 2');
            expect(points[1].address).toBe('Test address 2');
            expect(points[1].location.latitude).toBe(2);
            expect(points[1].location.longitude).toBe(2);
            done();
        }));
    });

    it('Поменять местами', (done) => {
        placesService.swap(commonPoints[0].id, commonPoints[2].id);
        subscriptions.push(placesService.points$.subscribe((points) => {
            expect(points[0].name).toBe('Test name 2');
            expect(points[0].address).toBe('Test address 2');
            expect(points[0].location.latitude).toBe(2);
            expect(points[0].location.longitude).toBe(2);

            expect(points[2].name).toBe('Test name 0');
            expect(points[2].address).toBe('Test address 0');
            expect(points[2].location.latitude).toBe(0);
            expect(points[2].location.longitude).toBe(0);
            done();
        }));
    });

    it('Изменение пункта', (done) => {
        subscriptions.push(placesService.pointChanged$.subscribe((point) => {
            expect(point.id).toBe(commonPoints[3].id);
            expect(point.name).toBe('Test name 100');
            expect(point.address).toBe('Test address 100');
            expect(point.location.latitude).toBe(100);
            expect(point.location.longitude).toBe(100);
            done();
        }));
        placesService.changePoint(commonPoints[3], generateScheme(100));
    });
});