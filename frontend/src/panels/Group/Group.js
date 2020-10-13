import NavBar from "../../components/NavBar/NavBar";
import {withRouter} from "react-router";
import React from "react";

class Group extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            group: null
        }
    }
    getGroup = () => {
        this.props.getGroup(this.props.match.params['id']).then((data) => {
            console.log(data.data)
            this.setState({
                group: data.data
            })
        })
    }
    componentDidMount() {
        this.getGroup();
    }

    render() {
        return <NavBar
            user={this.props.user}
            logOut={this.props.logOut}
            links={this.props.links}>
            {this.state.group && <>
                <div className={'user-center-container'}>
                    <div style={{display: "flex", paddingTop: '5px'}}>
                        <div>
                            <img className={'center-cropped'} style={{width: '300px', height: '300px'}}
                                 src={this.state.group.avatar_image}/>
                        </div>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <div style={{fontSize: '2em', color: '#3e7cb0', paddingLeft: '12px', fontWeight: 'bold'}}>
                                <div>
                                    {this.state.group.name}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
            }
        </NavBar>
    }
}
export default withRouter(Group)