import React from "react";
import './PostPhoto.css'

export default class PostPhoto extends React.Component {
    render() {
        return <div className={'curr-post-photo-container'}>
            <img className={'curr-post-photo'} src={this.props.photo.image}/>
            <span className={'delete-button'} onClick={() => this.props.delete(this.props.photo.id)}>
                x
            </span>
        </div>
    }
}