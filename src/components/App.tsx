import * as React from 'react';
import * as s from './App.css';
import {Map} from './Map/Map';
import {Sidebar} from './Sidebar/Sidebar';

export class App extends React.PureComponent {
  public render() {
    return (
      <div className={s.app}>
          <Map />
          <Sidebar />
      </div>
    );
  }
}
