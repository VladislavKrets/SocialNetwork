import React from "react";
import './Input.css'
class Input extends React.Component{
    render() {
        const style = this.props.style ? this.props.style : {}
        const props = this.props
        props.style = null
        return <div style={{...style}} className='input'>
            <input autoComplete={'off'} type='text' {...props}/>
        </div>
    }
}
export default Input