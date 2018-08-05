import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Sidebar} from './Sidebar';

describe(Sidebar.name, () => {
    it('Рендер', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Sidebar />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
