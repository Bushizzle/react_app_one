import React, {PureComponent} from 'react'

import './style.css'

class TemperatureSwitcher extends PureComponent {

    render() {

        return (
            <div className="WW_cell WW_cell__switcher" onClick={this.switchTemperatureMode}>

                <div className={`WW_switcher${this.props.temperatureMode === 'C' ? ' WW_switcher__active' : ''}`}>
                    <div className="WW_switcher_lever">
                        <div className="wi wi-fahrenheit"> </div>
                        <div className="wi wi-celsius"> </div>
                    </div>
                </div>

            </div>
        )
    }

    switchTemperatureMode = () => {
        const newState =  this.props.temperatureMode === 'C' ? 'F' : 'C';

        this.props.updateParent({
            temperatureMode: newState
        });

        localStorage.setItem('weatherAppTemperatureMode', newState);
    };

}

export default TemperatureSwitcher