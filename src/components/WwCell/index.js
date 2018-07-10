import React, {PureComponent} from 'react'


import './style.css'

class Cell extends PureComponent {
    render() {

        return (
            <div className={`WW_cell${this.props.addClass ? this.props.addClass.split(' ').map(className => ' WW_cell__' + className).join(' ') : '' }`}>
                { this.props.children }
            </div>
        )
    }
}

export default Cell