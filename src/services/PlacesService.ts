import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
/* tslint:disable:ordered-imports */
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/share';
import {DirectionPoint, TPointId} from '../entities/DirectionPoint';
import {IDirectionPointScheme} from '../schemes/IDirectionPointScheme';
import {injectable} from 'inversify';

@injectable()
export class PlacesService {
    public points$: Observable<DirectionPoint[]>;
    public pointChanged$: Observable<DirectionPoint>;

    protected points: DirectionPoint[] = [];
    protected pointsSubject: Subject<DirectionPoint[]>;
    protected pointChangedSubject: Subject<DirectionPoint>;

    constructor() {
        this.pointsSubject = new BehaviorSubject(this.points);
        this.points$ = this.pointsSubject.asObservable()
            .do(points => console.info(`[${PlacesService.name}] Обновился список точек`, points))
            .share();
        this.pointChangedSubject = new Subject();
        this.pointChanged$ = this.pointChangedSubject.asObservable()
            .do(point => console.info(`[${PlacesService.name}] Заменена точка`, point))
            .share();
    }

    /**
     * Добавить пункты
     * @param {DirectionPoint[]} points
     */
    public addPoints(points: IDirectionPointScheme[]) {
        this.points = [...this.points, ...points.map(p => DirectionPoint.create(p))];
        this.pointsSubject.next(this.points);
    }

    /**
     * Удалить пункты
     * @param {DirectionPoint[]} points
     */
    public removePoints(points: DirectionPoint[]) {
        const mapPoints: Map<TPointId, DirectionPoint> = new Map(points.map(p => ([p.id, p]) as [TPointId, DirectionPoint]));
        this.points = this.points.filter(p => !mapPoints.has(p.id));
        this.pointsSubject.next(this.points);
    }

    /**
     * Обновить пункт
     * @param {DirectionPoint} point
     * @param {IDirectionPointScheme} newPointData
     */
    public changePoint(point: DirectionPoint, newPointData: IDirectionPointScheme) {
        const index = this.points.indexOf(point);
        if (index === -1) {
            console.warn(`[${PlacesService.name}] Невозможно заменить пункт`, point);
            return;
        }
        point.update(newPointData);
        this.pointChangedSubject.next(point);
    }

    /**
     * Поменять местами пункты
     * @param {TPointId} from
     * @param {TPointId} to
     */
    public swap(from: TPointId, to: TPointId) {
        if (from === to) {
            return;
        }
        const fromPoint = this.points.find(p => p.id === from);
        const toPoint = this.points.find(p => p.id === to);
        if (!fromPoint || !toPoint) {
            console.warn(`[${PlacesService.name}] невозможно поменять местами, точки не найдены`, from, to);
            return;
        }
        const fromIndex = this.points.indexOf(fromPoint!);
        const toIndex = this.points.indexOf(toPoint!);
        this.points = [...this.points];
        this.points[fromIndex] = toPoint;
        this.points[toIndex] = fromPoint;
        this.pointsSubject.next(this.points);
    }
}