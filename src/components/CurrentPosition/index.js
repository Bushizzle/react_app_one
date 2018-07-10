import React, {PureComponent} from 'react'

import './style.css'

class CurrentPosition extends PureComponent {

    render() {
        return <button onClick={this.resetPosition}>current position</button>;
    }

    resetPosition = () => {
        localStorage.removeItem('weatherAppPosition');
        localStorage.removeItem('weatherAppData');
        this.props.resetParent();
    };

}

export default CurrentPosition