import * as React from 'react';
import {SortEnd} from 'react-sortable-hoc';
import {Subscription} from 'rxjs/Rx';
import {DirectionPoint} from '../../entities/DirectionPoint';
import {ioc} from '../../ioc';
import {PlacesService} from '../../services/PlacesService';
import * as s from './Sidebar.css';
import {SortablePointsList} from './Sortable/Sortable';

interface IProps {}
interface IState {
    points: DirectionPoint[];
}

export class Sidebar extends React.PureComponent<IProps, IState> {
    private subscription: Subscription;
    private placesService: PlacesService;

    constructor(props: IProps) {
        super(props);
        this.state = {points: []};
    }

    public componentDidMount() {
        this.placesService = ioc.get(PlacesService);
        this.subscription = this.placesService.points$.subscribe(this.onUpdatePoints);
    }

    public componentWillUnmount() {
        this.subscription.unsubscribe();
    }
    public render() {
        const {points} = this.state;
        return (
            <div className={s.sidebar}>
                {
                    points.length
                        ? <SortablePointsList
                            items={points}
                            onSortEnd={this.onSortEnd}
                            getContainer={this.getContainer}
                        />
                        : <div className={s.empty}>Для добавления пункта воспользуйтесь строкой поиска</div>
                }
            </div>
        );
    }

    /**
     * Получить контейнер для прокрутки при перемещении, ели есть скроллинг
     * ref использовать сложнее, т.к. придется заворачивать в promise
     * @return {HTMLDivElement}
     */
    private getContainer = ():HTMLDivElement => document.querySelector('.' + s.sidebar)! as HTMLDivElement;

    private onSortEnd = ({oldIndex, newIndex}: SortEnd) => {
        const {points} = this.state;
        const firstPoint = points[oldIndex];
        const secondPoint = points[newIndex];
        if (!firstPoint || !secondPoint) {
            console.error('[Sidebar] невозможно поменять местами');
            return;
        }
        this.placesService.swap(firstPoint.id, secondPoint.id);
    };

    private onUpdatePoints = (points: DirectionPoint[]) => {
        this.setState({points});
    }
}
