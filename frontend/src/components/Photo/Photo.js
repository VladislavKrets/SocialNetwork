import React from "react";
import './Photo.css'

export default class Photo extends React.Component {
    render() {
        return <img className={'curr-gallery-photo'} onClick={() => this.props.onClick(this.props.photo.image)}
                    src={this.props.photo.image}/>
    }
}