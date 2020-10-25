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
        this.messagesEndRef = React.createRef()
    }

    scrollToBottom = () => {
        if (this.state.dialog) {
            const objDiv = document.getElementById("message-box");
            objDiv.scrollTop = objDiv.scrollHeight;
        }
    }

    componentDidMount() {
        this.getDialog()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.scrollToBottom()
    }

    getDialog = () => {
        this.props.getDialog(this.props.match.params['id']).then(data => {
            this.setState({
                dialog: data.data
            })
            this.scrollToBottom()
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
                dialog.messages.push(data.data)
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
        const array = []
        for (let i = 0; i < 30; i++) {
            array.push(i)
        }
        return <NavBar user={this.props.user}
                       logOut={this.props.logOut}
                       links={this.props.links}>
            {this.state.dialog && <>
                {
                    this.state.isPhotoDialogOpened ?
                        <Alert close={this.onChangePhotoDialogState}>
                            <PhotoViewer photo={this.state.currentImage}/>
                        </Alert>
                        : null
                }
                <div className={'user-center-container'}>
                    <div style={{
                        width: '1000px',
                        backgroundColor: '#3e7cb0',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '12px',
                        alignItems: 'center',
                        color: 'antiquewhite',
                        borderRadius: '5px',
                        boxSizing: 'border-box',
                        border: '1px solid #3e7cb0',
                        fontWeight: 'bold',
                        borderBottomLeftRadius: '0',
                        borderBottomRightRadius: '0',
                        padding: '5px'
                    }}>
                        <div>
                            <img className={'center-cropped'} style={{width: '60px', height: '60px'}}
                                 src={this.state.dialog.user_to.avatar
                                     ? this.state.dialog.user_to.avatar.image : noAvatar}/>
                        </div>
                        <div style={{padding: '0 5px'}}>{this.state.dialog.user_to.name}</div>
                        <div>{this.state.dialog.user_to.surname}</div>
                    </div>
                </div>
                <div className={'user-center-container'} style={{paddingTop: '0'}}>
                    <div style={{
                        width: '1000px',
                        height: '500px',
                        overflowY: 'scroll',
                        border: '1px solid #3e7cb0',
                        borderRadius: '5px',
                        borderTopLeftRadius: '0',
                        borderTopRightRadius: '0',
                    }} id={'message-box'} ref={this.messagesEndRef}>
                        {this.state.dialog.messages.map(item => {
                            return <div style={{
                                display: "flex",
                                margin: '12px',
                                flexDirection: this.props.user.id === item.user.id ? 'row-reverse' : null
                            }}>
                                <div>
                                    <img className={'center-cropped'} style={{width: '60px', height: '60px'}}
                                         src={item.user.avatar ? item.user.avatar.image : noAvatar}/>
                                </div>
                                <div style={{
                                    width: '540px',
                                    border: '1px solid #3e7cb0',
                                    margin: '0 12px',
                                    padding: '7px',
                                    borderRadius: '7px'
                                }}>
                                    <div>
                                        {item.text}
                                    </div>
                                    <div className={'post-photo-gallery'} style={{justifyContent: 'center'}}>
                                        {item.images && item.images.map(item => {
                                            return <PostPhotoSaved style={{width: '100px', maxHeight: '200px'}}
                                                                   onClick={this.onPhotoClick} photo={item}/>
                                        })}
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>
                </div>
                <div className={'user-center-container'} style={{paddingTop: '5px'}}>
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
                        <textarea value={this.state.currentMessage.text} onChange={this.onMessageTextChangeListener}
                                  style={{
                                      width: '100%',
                                      height: '70px',
                                      resize: 'none',
                                      border: 'none',
                                      borderRadius: '4px',
                                      outline: 'none'
                                  }}
                                  placeholder={'Напишите здесь текст вашего сообщения'}/>
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