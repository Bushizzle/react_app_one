import React, {PureComponent} from 'react'

import './style.css'

class LoadingOverlay extends PureComponent {

    render() {
        return <div className="WW_loading"><div className="WW_loading-text">Loading</div></div>;
    }

}

export default LoadingOverlay