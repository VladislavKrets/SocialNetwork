import React from "react";
import './Button.css'
class Button extends React.Component{
    render() {
        const style = this.props.style ? this.props.style : {}
        const props = this.props
        props.style = null
        return <label className={'button'} style={{...style}}>
                <button {...props} style={{display: 'none'}} />
                <div style={{textAlign: 'center'}}>{this.props.children}</div>
            </label>
    }
}
export default Button