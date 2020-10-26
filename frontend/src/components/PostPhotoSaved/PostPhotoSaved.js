import React from "react";
import './PostPhotoSaved.css'

export default class Photo extends React.Component {

    render() {
        return <img className={'curr-post-saved-photo'}
                    style={this.props.style}
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        this.props.onClick(this.props.photo)
                    }}
                    src={this.props.photo.image}/>
    }
}