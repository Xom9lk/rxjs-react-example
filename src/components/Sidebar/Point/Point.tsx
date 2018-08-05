import * as React from 'react';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import {Subscription} from 'rxjs/Subscription';
import {DirectionPoint} from '../../../entities/DirectionPoint';
import {ioc} from '../../../ioc';
import {PlacesService} from '../../../services/PlacesService';
import * as s from './Point.css';

interface IProps {
    value: DirectionPoint;
}

interface IState {
    point: DirectionPoint;
}

export class Point extends React.Component<IProps, IState> {
    private static RenderText = ({name, address}: {name: string; address: string}) => name
        ? (<div className={s.name}><strong>{name}</strong> {address}</div>)
        : (<div className={s.name}>{address}</div>);

    private subscription: Subscription;
    private placesService: PlacesService;

    constructor(props: IProps) {
        super(props);
        
        this.placesService = ioc.get(PlacesService);
        // Подписаться на изменение пункта
        this.subscription = this.placesService.pointChanged$
            .filter(p => p.id === this.props.value.id)
            .distinctUntilChanged((x, y) => x.name !== y.name || x.address !== y.address)
            .subscribe(this.onUpdate);

        this.state = {point: props.value};
    }

    public componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    public render() {
        const {point} = this.state;
        return (
            <div className={s.point}>
                <Point.RenderText name={point.name} address={point.address} />
                <button className={s.remove} onClick={this.remove}>Удалить</button>
            </div>

        )
    }

    private remove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const {point} = this.state;
        e.preventDefault();
        this.placesService.removePoints([point]);
    };

    private onUpdate = (point: DirectionPoint) => this.setState({point});
}