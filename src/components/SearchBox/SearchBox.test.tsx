import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {SearchBox} from './SearchBox';

describe(SearchBox.name, () => {
    it('Рендер', () => {
        const div = document.createElement('div');
        ReactDOM.render(<SearchBox />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
