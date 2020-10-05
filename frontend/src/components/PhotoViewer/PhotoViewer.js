import React from "react";
import './PhotoViewer.css'
export default class PhotoViewer extends React.Component{
    render() {
        return <div style={{ padding: '12px'}}>
            <img className={'photo-viewer-img'} src={this.props.photo}/>
        </div>
    }
}