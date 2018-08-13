import {Observable} from 'rxjs/Observable';
/* tslint:disable:ordered-imports */
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/share';
import {DirectionPoint} from '../entities/DirectionPoint';
import {inject, injectable} from 'inversify';
import {PlacesService} from './PlacesService';

export interface IChangeLinesEvent {
    create: Map<DirectionPoint, DirectionPoint>;
    remove: Map<DirectionPoint, DirectionPoint>;
}

@injectable()
export class RouteService {
    /**
     * Поток точек для добавления
     */
    public createMarkers$: Observable<DirectionPoint[]>;

    /**
     * Поток точек для удаления
     */
    public removeMarkers$: Observable<DirectionPoint[]>;

    /**
     * Поток ребер графа для удаления и добавления
     */
    public changeLines$: Observable<IChangeLinesEvent>;

    constructor(@inject(PlacesService) protected placesService: PlacesService) {
        // Формируется необходимый набор данных для изменения графа
        const points$ = this.placesService.points$
            .distinctUntilChanged()
            .pairwise()
            .map(([currentPoints, nextPoints]) => {
                // Формируются набор данных для удобного сбора объектов для удаления и создания
                const currentPointsSet: Set<DirectionPoint> = new Set(currentPoints);
                const nextPointsSet: Set<DirectionPoint> = new Set(nextPoints);
                const nextLinesMap: Map<DirectionPoint, DirectionPoint> =
                    nextPoints.reduce<Map<DirectionPoint, DirectionPoint>>((ac, p, index) => {
                        if (index !== nextPoints.length - 1) {
                            ac.set(p, nextPoints[index + 1]);
                        }
                        return ac;
                    }, new Map());
                const currentLinesMap: Map<DirectionPoint, DirectionPoint> =
                    currentPoints.reduce<Map<DirectionPoint, DirectionPoint>>((ac, p, index) => {
                        if (index !== currentPoints.length - 1) {
                            ac.set(p, currentPoints[index + 1]);
                        }
                        return ac;
                    }, new Map());
                return {currentPoints, currentPointsSet, nextPoints, nextPointsSet, nextLinesMap, currentLinesMap};
            })
            .share();

        this.createMarkers$ = points$
            .map(({currentPointsSet, nextPoints}) => nextPoints.filter(p => !currentPointsSet.has(p)))
            .filter(points => points.length > 0)
            .share()
            .do(points => console.info(`[${RouteService.name}] Добавились точки`, points));
        this.removeMarkers$ = points$
            .map(({currentPoints, nextPointsSet}) => currentPoints.filter(p => !nextPointsSet.has(p)))
            .filter(points => points.length > 0)
            .share()
            .do(points => console.info(`[${RouteService.name}] Удалились точки`, points));
        this.changeLines$ = points$
            .map(
                ({currentLinesMap, nextLinesMap}) => {
                    const create = [...nextLinesMap.keys()]
                        .reduce<Map<DirectionPoint, DirectionPoint>>((ac, p) => {
                            if (!currentLinesMap.has(p) || currentLinesMap.get(p) !== nextLinesMap.get(p)) {
                                ac.set(p, nextLinesMap.get(p)!);
                            }
                            return ac;
                        }, new Map());

                    const remove = [...currentLinesMap.keys()]
                        .reduce<Map<DirectionPoint, DirectionPoint>>((ac, p) => {
                            if (!nextLinesMap.has(p) || nextLinesMap.get(p) !== currentLinesMap.get(p)) {
                                ac.set(p, currentLinesMap.get(p)!);
                            }
                            return ac;
                        }, new Map());

                    return {create, remove};
                }
            )
            .filter(change => change.create.size > 0 || change.remove.size > 0)
            .share()
            .do(lines => console.info(`[${RouteService.name}] Обновление линий`, lines));
    }
}