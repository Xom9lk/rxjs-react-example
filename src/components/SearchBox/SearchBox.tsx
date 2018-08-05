import * as React from 'react';
import * as s from './SearchBox.css';

interface IProps {
}

interface IState {
}

export class SearchBox extends React.PureComponent<IProps, IState> {
    public input: React.RefObject<HTMLInputElement>;

    constructor(props: IProps) {
        super(props);
        this.input = React.createRef();
    }

    public render() {
        return (
            <input className={s.input} ref={this.input} type="text" placeholder="Найти точку" />
        );
    }
}