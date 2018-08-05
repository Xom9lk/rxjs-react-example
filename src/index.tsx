import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './ioc';
/* tslint:disable:ordered-imports */
import {App} from "./components/App";
import './index.css';

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
