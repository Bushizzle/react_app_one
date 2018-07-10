import React, {PureComponent} from 'react'

import './style.css'

class Row extends PureComponent {
    render() {
        return (
            <div className={`WW_row${this.props.addClass ? this.props.addClass.split(' ').map(className => ' WW_row__' + className).join(' ') : '' }`}>
                { this.props.children }
            </div>
        )
    }
}

export default Row