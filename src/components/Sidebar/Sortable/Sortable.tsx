import * as React from 'react';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import {DirectionPoint} from '../../../entities/DirectionPoint';
import {Point} from '../Point/Point';

export const SortablePoint = SortableElement(Point);
export const SortablePointsList = SortableContainer(({items}: {items: DirectionPoint[]}) => {
    return (
        <div>
            {items.map((point: DirectionPoint, index) => (
                <SortablePoint key={point.id} index={index} value={point} />
            ))}
        </div>
    );
});