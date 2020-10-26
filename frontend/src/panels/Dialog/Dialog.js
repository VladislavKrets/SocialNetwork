import {Link, withRouter} from 'react-router-dom'
import React from "react";
import NavBar from "../../components/NavBar/NavBar";
import PostPhoto from "../../components/PostPhoto/PostPhoto";
import Button from "../../components/Button/Button";
import noAvatar from "../../img/no-avatar.png";
import './Dialog.css'
import PostPhotoSaved from "../../components/PostPhotoSaved/PostPhotoSaved";
import Alert from "../../components/Alert/Alert";
import PhotoViewer from "../../components/PhotoViewer/PhotoViewer";

class Dialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentMessage: {
                text: '',
                images: [],
                dialog: this.props.match.params['id']
            },
            dialog: null
        }
    }

    scrollToBottom = () => {
        if (this.state.dialog) {
            this.messagesEndRef.current.scrollTop = this.messagesEndRef.current.scrollHeight
                * this.state.dialog.messages.length

        }
    }

    componentDidMount() {
        this.getDialog()
        this.interval = setInterval(() => this.getDialog(), 1000);
        document.title = "Сообщения"
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    handleKeyDown = (event) => {
        if (event.ctrlKey && event.key === "Enter") {
            this.onMessageSend()
        }
    }

    getDialog = () => {
        this.props.getDialog(this.props.match.params['id']).then(data => {
            const newMessagesLength = data.data.messages ? data.data.messages.length : 0;
            const oldMessagesLength = this.state.dialog ? this.state.dialog.messages.length : 0;
            if (this.state.dialog === null || newMessagesLength > oldMessagesLength) {
                this.setState({
                    dialog: data.data
                })
            }
        })
    }

    onPhotoClick = (image) => {
        this.setState({
            currentImage: image,
            isPhotoDialogOpened: true,
        })

    }
    onChangePhotoDialogState = () => {
        this.setState({
            currentImage: null,
            isPhotoDialogOpened: false,
        })
    }
    onMessageTextChangeListener = e => {
        const message = this.state.currentMessage
        message.text = e.target.value;
        this.setState({
            currentMessage: message
        })
    }
    onMessageSend = () => {
        const message = this.state.currentMessage;
        message.images = message.images.map(x => x.id)
        if (!(message.text === '' && message.images.length === 0)) {
            this.props.sendMessage(message).then(data => {
                const dialog = this.state.dialog;
                dialog.messages.unshift(data.data)
                this.setState({
                    post: dialog,
                    currentMessage: {
                        text: '',
                        images: [],
                        dialog: this.props.match.params['id']
                    }
                })
            })
        }
    }
    handlePostImageChange = (e) => {
        const image = e.target.files[0];
        this.props.postImageUpload(image).then(data => {
            const message = this.state.currentMessage
            message.images.push(data.data)
            this.setState({
                currentMessage: message
            })
        }).catch(e => {

        })
    }

    render() {
        return <NavBar user={this.props.user}
                       logOut={this.props.logOut}
                       links={this.props.links}>
            {this.state.dialog !== null && <>
                {
                    this.state.isPhotoDialogOpened ?
                        <Alert close={this.onChangePhotoDialogState}>
                            <PhotoViewer photo={this.state.currentImage}/>
                        </Alert>
                        : null
                }
                <div className={'user-center-container'} style={{paddingTop: '15px'}}>
                    <div style={{
                        border: '1px solid #3e7cb0',
                        borderRadius: '5px',
                    }}>
                        <Link style={{
                            width: '1000px',
                            backgroundColor: '#3e7cb0',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'antiquewhite',
                            borderRadius: '5px',
                            boxSizing: 'border-box',
                            border: '1px solid #3e7cb0',
                            fontWeight: 'bold',
                            padding: '5px',
                            textDecoration: 'none'
                        }} to={`/user/${this.state.dialog.user_to.id}`} target="_blank">
                            <div>
                                <img className={'center-cropped'} style={{width: '60px', height: '60px'}}
                                     src={this.state.dialog.user_to.avatar
                                         ? this.state.dialog.user_to.avatar.image : noAvatar}/>
                            </div>
                            <div style={{padding: '0 5px'}}>{this.state.dialog.user_to.name}</div>
                            <div>{this.state.dialog.user_to.surname}</div>
                        </Link>

                        <div style={{
                            width: '1000px',
                            height: '500px',
                            display: 'flex',
                            flexDirection: 'column-reverse',
                            justifyContent: this.state.dialog.messages.length === 0 ? 'center' : null,
                            alignItems: this.state.dialog.messages.length === 0 ? 'center' : null,
                            overflowY: 'scroll',

                        }} id={'message-box'}>
                            {this.state.dialog.messages.length === 0 && <div>
                                Нет сообщений с данным пользователем
                            </div>}
                            {this.state.dialog.messages.map(item => {
                                let images = item.images
                                const date = new Date(item.date)
                                const curr_date = date.getDate();
                                const curr_month = date.getMonth() + 1;
                                const curr_year = date.getFullYear();
                                const curr_hours = date.getHours()
                                const curr_minutes = date.getMinutes()
                                const curr_seconds = date.getSeconds()
                                return <div style={{
                                    display: "flex",
                                    padding: '12px',
                                    flexDirection: this.props.user.id === item.user.id ? 'row-reverse' : null
                                }}>
                                    <Link to={`/user/${item.user.id}`} target="_blank" style={{textDecoration: 'none'}}>
                                        <img className={'center-cropped'} style={{width: '60px', height: '60px'}}
                                             src={item.user.avatar ? item.user.avatar.image : noAvatar}/>
                                    </Link>
                                    <div style={{
                                        width: '540px',
                                        border: '1px solid #3e7cb0',
                                        margin: '0 12px',
                                        padding: '7px',
                                        borderRadius: '7px'
                                    }}>
                                        <div style={{wordBreak: 'break-word'}}>
                                            {item.text}
                                        </div>
                                        <div className={'post-photo-gallery'} style={{justifyContent: 'center'}}>
                                            {item.images && item.images.map(item => {
                                                return <PostPhotoSaved style={{width: '100px', maxHeight: '200px'}}
                                                                       onClick={this.onPhotoClick} photo={item}/>
                                            })}
                                        </div>
                                    </div>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'grey',
                                        fontSize: '0.8em',
                                        paddingRight: '20px',
                                    }}>
                                            {(curr_hours < 10 ? "0" + curr_hours : curr_hours)
                                            + ":" + (curr_minutes < 10 ? "0" + curr_minutes : curr_minutes)
                                            + ":" + (curr_seconds < 10 ? "0" + curr_seconds : curr_seconds)
                                            + " " + (curr_date < 10 ? "0" + curr_date : curr_date)
                                            + "-" + (curr_month < 10 ? "0" + curr_month : curr_month)
                                            + "-" + curr_year}
                                        </span>
                                </div>
                            })}
                            <div/>
                        </div>
                    </div>
                </div>
                <div className={'user-center-container'} style={{paddingTop: '5px', paddingBottom: '15px'}}>
                    <div style={{
                        width: '1000px',
                        backgroundColor: '#3e7cb0',
                        borderRadius: '7px',
                        padding: '15px',

                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                        <textarea value={this.state.currentMessage.text} onKeyDown={this.handleKeyDown} onChange={this.onMessageTextChangeListener}
                                  style={{
                                      width: '100%',
                                      height: '70px',
                                      resize: 'none',
                                      border: 'none',
                                      borderRadius: '4px',
                                      outline: 'none'
                                  }}
                                  placeholder={'Напишите здесь текст вашего сообщения и нажмите ctrl+enter'}/>
                        </div>

                        <div className={'post-photo-gallery'}>
                            {this.state.currentMessage.images.map(item => {
                                return <PostPhoto photo={item} delete={(id) => {
                                    this.props.deletePostImage(id).then(() => {
                                        const message = this.state.currentMessage
                                        message.images = message.images.filter(x => x.id !== id)
                                        this.setState({
                                            currentMessage: message
                                        })
                                    })
                                }}/>
                            })}
                        </div>
                        <div style={{textAlign: 'right'}}>
                            <Button>
                                <label><input className={'image-button'} type="file"
                                              style={{display: "none"}}
                                              value={''}
                                              accept="image/png, image/jpeg" onChange={this.handlePostImageChange}/>
                                    Прикрепить фото</label>
                            </Button>
                            <Button onClick={this.onMessageSend}>
                                Отправить
                            </Button>
                        </div>
                    </div>
                </div>
            </>
            }
        </NavBar>
    }
}

export default withRouter(Dialog)