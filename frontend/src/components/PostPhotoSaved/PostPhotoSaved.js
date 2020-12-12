import React from "react";
import './PostPhotoSaved.css'

export default class Photo extends React.Component {

    render() {
        const className = this.props.className;
        return <img className={'curr-post-saved-photo' + (className ? (" " + className) : "")}
                    style={this.props.style}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        this.props.onClick(this.props.photo)
                    }}
                    src={this.props.photo.image}/>
    }
}