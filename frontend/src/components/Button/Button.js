import React from "react";
import './Button.css'
class Button extends React.Component{
    render() {
        const style = this.props.style ? this.props.style : {}
        const props = this.props
        props.style = null
        return <div className={'button'} style={{...style}}>
            <label>
                <button {...props} style={{display: 'none'}} />
                <div style={{textAlign: 'center'}}>{this.props.children}</div>
            </label>
        </div>
    }
}
export default Button