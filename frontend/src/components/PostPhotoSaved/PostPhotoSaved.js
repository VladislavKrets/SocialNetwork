import React from "react";
import './PostPhotoSaved.css'

export default class Photo extends React.Component {
    render() {
        return <img className={'curr-post-saved-photo'}
                    onClick={() => this.props.onClick(this.props.photo.image)}
                    src={this.props.photo.image}/>
    }
}