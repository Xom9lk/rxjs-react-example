import {IDirectionPointScheme} from '../schemes/IDirectionPointScheme';

export type TPointId = string;

function uuidv4() {
    /* tslint:disable:no-bitwise */
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export class DirectionPoint {
    public static create(point: IDirectionPointScheme, id?: TPointId): DirectionPoint {
        const directionPoint = new DirectionPoint(id);
        directionPoint.location = point.location;
        directionPoint.name = point.name;
        directionPoint.address = point.address;
        return directionPoint;
    }

    public readonly id: TPointId;

    public name: string;
    public address: string;
    public location: {latitude: number, longitude: number};

    constructor(id?: TPointId) {
        this.id = id ? id : uuidv4();
    }

    public update(data: IDirectionPointScheme) {
        this.location = data.location;
        this.name = data.name;
        this.address = data.address;
    }
}