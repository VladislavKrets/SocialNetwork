import React from "react";
import NavBar from "../../components/NavBar/NavBar";
export default class Dialogs extends React.Component{
    componentDidMount() {
        this.props.getDialogs()
    }

    render() {
        return <NavBar user={this.props.user}
            logOut={this.props.logOut}
            links={this.props.links}>
            <div className={'user-center-container'}>
                <span style={{color: '#3e7cb0', fontWeight: 'bold', fontSize: '1.2em'}}>Мои сообщения</span>
            </div>
        </NavBar>
    }
}