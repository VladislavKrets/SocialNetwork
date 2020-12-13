import React from "react";
import NavBar from "../../components/NavBar/NavBar";
import Alert from "../../components/Alert/Alert";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import {Link, withRouter} from 'react-router-dom'
import noAvatar from "../../img/no-image-group.jpg";
import './Groups.css'

class Groups extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isCreateGroupDialogOpened: false,
            currentGroup: {
                name: null,
                avatar_image: null
            },
            searchData: {
                name: ''
            },
            avatar: null,
            myGroups: null,
            chosen: 'my groups',
            isRemoveDialogOpened: false,
            currentGroupId: null,
            currentImage: null,
        }
    }

    onChangeRemoveDialogState = (id) => {
        this.setState({
            isRemoveDialogOpened: !this.state.isRemoveDialogOpened,
            currentGroupId: id,
        })
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
            group.avatar_image = data.data.id
            this.setState({
                currentGroup: group,
                avatar: data.data,
                currentImage: data.data
            })
        }).catch(e => {

        })
    }
    createGroup = () => {
        const data = {}
        Object.keys(this.state.currentGroup).forEach((key) => {
            if (this.state.currentGroup[key]) data[key] = this.state.currentGroup[key]
        });
        this.props.createGroup(data).then(data => {
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
            currentImage: null,
            avatar: null
        })
    }
    getMyGroups = () => {
        document.title = "Мои группы"
        this.props.getMyGroups().then(data => {
            this.setState({
                myGroups: data.data
            })
        })
    }
    getGroups = () => {
        document.title = "Все группы"
        this.props.getGroups().then(data => {
            this.setState({
                myGroups: data.data
            })
        })
    }
    getAdminGroups = () => {
        document.title = "Администрируемые группы"
        this.props.getMyAdminGroups().then(data => {
            this.setState({
                myGroups: data.data
            })
        })
    }

    componentDidMount() {
        this.getMyGroups();
        document.title = "Мои группы"
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
                            if (group.id === id) group.is_subscribed = false
                            return group
                        })
                    })
                    break
            }
        })
    }

    searchGroups = (data) => {
        const searchData = {
            ...data,
            chooser: this.state.chosen,
        }
        this.props.searchGroups(searchData).then((data) => {
            this.setState({
                myGroups: data.data
            })
        })
    }

    handleSearchChange = (e) => {
        const searchData = this.state.searchData
        searchData[e.target.name] = e.target.value
        if (e.target.name === 'name') this.searchGroups(searchData)
        this.setState({
            searchData: searchData
        })
    }

    render() {
        return <NavBar
            user={this.props.user}
            setCurrentLink={this.props.setCurrentLink}
            currentLink={this.props.currentLink}
            logOut={this.props.logOut}
            links={this.props.links}>
            {this.state.isCreateGroupDialogOpened &&
            <Alert style={{backgroundColor: '#f7faff', borderRadius: '12px',}}
                   close={this.onChangeCreateGroupDialogState}>
                <div className={'groups-alert-creation'}>
                    <div style={{
                        textAlign: 'center',
                        fontSize: '1.2em',
                        color: '#3e7cb0',
                        fontWeight: 'bold',
                        paddingBottom: '12px'
                    }}>Создание группы
                    </div>
                    <div style={{display: "flex", flexDirection: 'column', alignItems: 'center'}}>
                        <div>
                            Название группы
                        </div>
                        <Input
                            placeholder={'Group name'}
                            style={{width: '300px'}}
                            name={'name'}
                            value={this.state.currentGroup.name}
                            onChange={this.handleChange}
                        />
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            {this.state.currentGroup.avatar_image &&
                            <img className={'center-cropped'} src={this.state.currentImage.image}/>}
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
                            <Button style={{backgroundColor: '#199912', color: '#f7faff', border: 'none'}}
                                    onClick={this.createGroup}>
                                Сохранить
                            </Button>
                            <Button style={{backgroundColor: '#3e7cb0', color: '#f7faff', border: 'none'}}
                                    onClick={() => {
                                        this.onChangeCreateGroupDialogState()
                                        this.setStateDefault()
                                    }}>
                                Отмена
                            </Button>
                        </div>
                    </div>
                </div>
            </Alert>
            }
            {
                this.state.isRemoveDialogOpened ?
                    <Alert style={{backgroundColor: '#f7faff', borderRadius: '12px',}}
                           close={() => {
                               this.onChangeRemoveDialogState(null)
                           }}>
                        <div style={{
                            width: '300px',
                            borderRadius: '12px',
                            backgroundColor: '#f7faff'
                        }}>
                            <div style={{padding: '20px 12px', wordBreak: 'break-word', textAlign: 'center'}}>
                                Вы действительно хотите отписаться от данной группы?
                            </div>
                            <div style={{
                                display: 'flex',
                                fontWeight: 'bold',
                                width: '100%',
                                borderTop: '1px solid grey'
                            }}>
                                <div style={{
                                    textAlign: 'center',
                                    width: '50%',
                                    borderRight: '1px solid grey',
                                    padding: '12px 0',
                                    color: 'red',
                                    cursor: 'pointer'
                                }} onClick={() => {
                                    this.groupUnsubscribe(this.state.currentGroupId)
                                    this.onChangeRemoveDialogState(null)
                                }}>
                                    Отписаться
                                </div>
                                <div style={{
                                    width: '50%',
                                    textAlign: 'center',
                                    padding: '12px 0',
                                    color: '#3e7cb0',
                                    cursor: 'pointer'
                                }} onClick={() => {
                                    this.onChangeRemoveDialogState(null)
                                }}>
                                    Отмена
                                </div>
                            </div>
                        </div>
                    </Alert>
                    : null
            }
            <div className={'groups-title'}>
                {this.state.chosen === 'my groups' ? 'Мои группы'
                    : this.state.chosen === 'admin' ? 'Администрируемые группы' : 'Все группы'}
            </div>
            <div className={'desktop'} style={{display: 'flex', justifyContent: 'center', paddingBottom: '20px'}}>
                <Input type={'text'} name={'name'} style={{width: '800px'}} placeholder={'Поиск'}
                       onChange={this.handleSearchChange} value={this.state.searchData.name}/>
            </div>
            <div className={'mobile'} style={{display: 'flex', justifyContent: 'center', paddingBottom: '20px'}}>
                <Input type={'text'} name={'name'} style={{width: '320px'}} placeholder={'Поиск'}
                       onChange={this.handleSearchChange} value={this.state.searchData.name}/>
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
                        backgroundColor: this.state.chosen === 'my groups' ? 'antiquewhite' : '#3e7cb0',
                        color: this.state.chosen === 'my groups' ? '#3e7cb0' : null,
                        borderBottomLeftRadius: '7px',
                        borderTopLeftRadius: '7px',
                    }} className={'group-type-chooser-item'} onClick={() => {
                        this.setState({
                            chosen: 'my groups', myGroups: null, searchData: {
                                name: ''
                            },
                        })
                        this.getMyGroups()
                    }}>
                        <span className={'desktop'}>Мои группы</span>
                        <span className={'mobile'}>Мои</span>
                    </div>
                    <div style={{
                        textAlign: 'center',
                        backgroundColor: this.state.chosen === 'admin' ? 'antiquewhite' : '#3e7cb0',
                        color: this.state.chosen === 'admin' ? '#3e7cb0' : null,
                        borderLeft: '1px solid antiquewhite'
                    }} className={'group-type-chooser-item'} onClick={() => {
                        this.setState({
                            chosen: 'admin', myGroups: null, searchData: {
                                name: ''
                            },
                        })
                        this.getAdminGroups()
                    }}>
                        <span className={'desktop'}>Администрируемые группы</span>
                        <span className={'mobile'}>Администрируемые</span>
                    </div>
                    <div style={{
                        textAlign: 'center',
                        backgroundColor: this.state.chosen === 'groups' ? 'antiquewhite' : '#3e7cb0',
                        color: this.state.chosen === 'groups' ? '#3e7cb0' : null,
                        borderBottomRightRadius: '7px',
                        borderTopRightRadius: '7px',
                        borderLeft: '1px solid antiquewhite'
                    }} className={'group-type-chooser-item'} onClick={() => {
                        this.setState({
                            chosen: 'groups', myGroups: null, searchData: {
                                name: ''
                            },
                        })
                        this.getGroups()
                    }}>
                        <span className={'desktop'}>Все группы</span>
                        <span className={'mobile'}>Все</span>
                    </div>
                </span>
            </div>
            <div style={{display: "flex", justifyContent: "center", paddingTop: '30px'}}>
                <div className={'create-group-block'}>
                    <span
                        className={'group-create-button'} onClick={() => this.onChangeCreateGroupDialogState()}>
                        <span className={'group-create-button-plus'}>+</span><span>Создать группу</span>
                    </span>
                </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', paddingTop: '30px'}}>
                <div className={'groups-current-group-block'}>
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
                                target="_blank"
                                to={`/group/${item.id}`}
                            >
                                <div>
                                    <img className={'center-cropped groups-avatar-image'}
                                         src={item.avatar_image ? item.avatar_image.image : noAvatar}
                                    />
                                </div>
                                <div>
                                    <span className={'groups-group-name'} >
                                        {item.name}
                                    </span>
                                </div>
                                {!item.is_subscribed ?
                                    <div className={'groups-subscribe-block'} style={{
                                        cursor: 'pointer',
                                        backgroundColor: '#36965d',
                                        fontWeight: 'normal',
                                        color: 'antiquewhite',
                                        borderRadius: '5px 10px',
                                        padding: '5px 15px',
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
                                        <div className={'groups-unsubscribe-block'}>
                                            <span onClick={(e) => {
                                                e.stopPropagation()
                                                e.preventDefault();
                                                this.onChangeRemoveDialogState(item.id)
                                            }}
                                                  style={{
                                                      color: 'red',
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
            {this.state.myGroups && this.state.myGroups.length === 0 &&
            <div style={{display: 'flex', justifyContent: 'center', paddingTop: '30px'}}>
                {this.state.chosen === 'my groups'
                    ? 'Вы не подписаны ни на одну группу'
                    : this.state.chosen === 'admin'
                        ? 'Вы не администрируете ни одну группу'
                        : 'Ни одной группы еще не создано'}
            </div>
            }
        </NavBar>
    }
}

export default withRouter(Groups)