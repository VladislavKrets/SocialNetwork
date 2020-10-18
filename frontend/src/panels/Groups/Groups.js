import React from "react";
import NavBar from "../../components/NavBar/NavBar";
import Alert from "../../components/Alert/Alert";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import {Link, withRouter} from 'react-router-dom'
import noAvatar from "../../img/no-image-group.jpg";

class Groups extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isCreateGroupDialogOpened: false,
            currentGroup: {
                name: null,
                avatar_image: null
            },
            avatar: null,
            myGroups: null,
            chosen: 'my groups'
        }
    }

    handleChange = (e) => {
        const group = this.state.currentGroup;
        group[e.target.name] = e.target.value;
        this.setState({
            currentGroup: group
        })
    }

    onChangeCreateGroupDialogState = () => {
        this.setState({
            isCreateGroupDialogOpened: !this.state.isCreateGroupDialogOpened
        })
    }
    handleImageChange = (e) => {
        const image = e.target.files[0];
        this.props.imageUpload(image).then(data => {
            const group = this.state.currentGroup
            group.avatar_image = data.data.image
            this.setState({
                currentGroup: group,
                avatar: data.data
            })
        }).catch(e => {

        })
    }
    createGroup = () => {
        this.props.createGroup(this.state.currentGroup).then(data => {
            this.setStateDefault()
            this.props.history.push(`/group/${data.data.id}`)
        })
    }
    setStateDefault = () => {
        this.setState({
            isCreateGroupDialogOpened: false,
            currentGroup: {
                groupName: null,
                avatar_image: null
            },
            avatar: null
        })
    }
    getMyGroups = () => {
        this.props.getMyGroups().then(data => {
            this.setState({
                myGroups: data.data
            })
        })
    }
    getGroups = () => {
        this.props.getGroups().then(data => {
            this.setState({
                myGroups: data.data
            })
        })
    }

    componentDidMount() {
        this.getMyGroups();
    }

    groupSubscribe = (id) => {
        this.props.groupSubscribe(id).then(() => {
            const groups = this.state.myGroups.map(group => {
                if (group.id === id) group.is_subscribed = true
                return group
            })

            this.setState({
                myGroups: groups
            })
        })
    }

    groupUnsubscribe = (id) => {
        this.props.groupUnsubscribe(id).then(() => {
            const groups = this.state.myGroups
            switch (this.state.chosen) {
                case "my groups":
                    this.setState({
                        myGroups: groups.filter(x => x.id !== id)
                    })
                    break
                case "groups":
                    this.setState({
                        myGroups: groups.map(group => {
                            if (group.id === id) group.is_subscribed = true
                            return group
                        })
                    })
                    break
            }
        })
    }

    render() {
        return <NavBar
            user={this.props.user}
            logOut={this.props.logOut}
            links={this.props.links}>
            {this.state.isCreateGroupDialogOpened &&
            <Alert close={this.onChangeCreateGroupDialogState}>
                <div style={{width: '600px', padding: '12px', borderRadius: '7px', backgroundColor: '#d5dde6'}}>
                    <div style={{display: 'flex', flexDirection: 'row-reverse'}}><span
                        style={{color: '#3e7cb0', fontWeight: 'bold', fontSize: '2em', cursor: 'pointer'}}
                        onClick={this.onChangeCreateGroupDialogState}>X</span></div>
                    <div style={{display: "flex", flexDirection: 'column', alignItems: 'center'}}>
                        <Input
                            placeholder={'Group name'}
                            style={{width: '300px'}}
                            name={'name'}
                            value={this.state.currentGroup.name}
                            onChange={this.handleChange}
                        />
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            {this.state.currentGroup.avatar_image &&
                            <img className={'center-cropped'} src={this.state.currentGroup.avatar_image}/>}
                        </div>
                        <div style={{display: "flex"}}>
                            <label className='button' style={{
                                width: '150px',
                                textAlign: 'center'
                            }}>
                                <input className={'image-button'} type="file"
                                       style={{display: "none"}}

                                       accept="image/png, image/jpeg" onChange={this.handleImageChange}/>
                                Загрузить аватар
                            </label>
                            <Button style={{width: '150px',}} onClick={() => {
                                this.props.imageDelete(this.state.avatar.id)
                                const group = this.state.currentGroup
                                group.avatar_image = null
                                this.setState({
                                    avatar: null
                                })
                            }}>
                                Удалить аватар
                            </Button>
                        </div>
                        <div>
                            <Button onClick={this.createGroup}>
                                Сохранить
                            </Button>
                            <Button>
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            </Alert>
            }
            <div style={{
                display: "flex",
                justifyContent: "center",
                padding: '20px',
                fontSize: '2em',
                color: '#3e7cb0',
                textAlign: 'center',
                fontWeight: 'bold'
            }}>
                Мои группы
            </div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <span style={{
                    display: 'flex',
                    color: 'antiquewhite',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>
                    <div style={{
                        textAlign: 'center',
                        width: '150px',
                        padding: '15px',
                        backgroundColor: this.state.chosen === 'my groups' ? 'antiquewhite' : '#3e7cb0',
                        color: this.state.chosen === 'my groups' ? '#3e7cb0' : null,
                        borderBottomLeftRadius: '7px',
                        borderTopLeftRadius: '7px',
                    }} onClick={() => {
                        this.setState({chosen: 'my groups', myGroups: null})
                        this.getMyGroups()
                    }}>
                        Мои группы
                    </div>
                    <div style={{
                        textAlign: 'center',
                        width: '150px',
                        padding: '15px',
                        backgroundColor: this.state.chosen === 'groups' ? 'antiquewhite' : '#3e7cb0',
                        color: this.state.chosen === 'groups' ? '#3e7cb0' : null,
                        borderBottomRightRadius: '7px',
                        borderTopRightRadius: '7px'
                    }} onClick={() => {
                        this.setState({chosen: 'groups', myGroups: null})
                        this.getGroups()
                    }}>
                        Все группы
                    </div>
                </span>
            </div>
            <div style={{display: "flex", justifyContent: "center", paddingTop: '30px'}}>
                <div style={{width: "1000px", display: 'flex', flexDirection: 'row-reverse'}}>
                    <span
                        style={{
                            fontSize: '1.2em',
                            color: 'green',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        onClick={() => this.onChangeCreateGroupDialogState()}>
                        <span style={{fontSize: '1.5em', paddingRight: '5px'}}>+</span><span>Создать группу</span>
                    </span>
                </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', paddingTop: '30px'}}>
                <div style={{width: '1000px'}}>
                    {this.state.myGroups && this.state.myGroups.map(item => {
                        return <div>
                            <Link
                                style={{
                                    textDecoration: 'none',
                                    padding: '12px 0',
                                    borderBottom: '1px solid #3e7cb0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    color: '#3e7cb0',
                                    alignItems: 'center',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '1.2em'
                                }}
                                to={`/group/${item.id}`}
                            >
                                <div>
                                    <img style={{width: '130px', height: '130px'}}
                                         className={'center-cropped'}
                                         src={item.avatar_image ? item.avatar_image : noAvatar}
                                    />
                                </div>
                                <div>
                                    <span style={{paddingRight: '12px'}}>
                                        {item.name}
                                    </span>
                                </div>
                                {!item.is_subscribed ?
                                    <div style={{
                                        cursor: 'pointer',
                                        backgroundColor: '#36965d',
                                        width: '210px',
                                        fontWeight: 'normal',
                                        color: 'antiquewhite',
                                        borderRadius: '5px 10px',
                                        fontSize: '1em',
                                        padding: '5px 15px',
                                        textAlign: 'center',
                                    }} onClick={e => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        this.groupSubscribe(item.id)
                                    }
                                    }>
                                        Подписаться
                                    </div>
                                    :
                                    <div style={{textAlign: 'center'}}>
                                        <div
                                            style={{
                                                width: '210px',
                                                textAlign: 'center'
                                            }}>
                                            <span onClick={(e) => {
                                                e.stopPropagation()
                                                e.preventDefault();
                                                this.groupUnsubscribe(item.id)
                                                    }}
                                                  style={{
                                                      color: 'red',
                                                      fontSize: '0.8em',
                                                      fontWeight: "normal",
                                                      cursor: 'pointer',
                                                      borderBottom: '1px solid red',
                                                  }}>Отписаться
                                            </span>
                                        </div>
                                    </div>
                                }
                            </Link>
                        </div>
                    })}
                </div>
            </div>
        </NavBar>
    }
}

export default withRouter(Groups)