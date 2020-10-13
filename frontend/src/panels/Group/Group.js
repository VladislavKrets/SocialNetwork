import NavBar from "../../components/NavBar/NavBar";
import React from "react";

export default class Group extends React.Component{
    render() {
        return <NavBar
            user={this.props.user}
            logOut={this.props.logOut}
            links={this.props.links}>

        </NavBar>
    }
}