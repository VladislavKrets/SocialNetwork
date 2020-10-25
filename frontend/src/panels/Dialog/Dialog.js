import {Link, withRouter} from 'react-router-dom'
import React from "react";
import NavBar from "../../components/NavBar/NavBar";
import PostPhoto from "../../components/PostPhoto/PostPhoto";
import Button from "../../components/Button/Button";
import './Dialog.css'

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
                <div className={'user-center-container'}>
                    <div style={{
                        width: '1000px',
                        height: '500px',
                        overflowY: 'scroll',
                        border: '1px solid black',
                        borderRadius: '3px'
                    }} id={'message-box'} ref={this.messagesEndRef}>
                        {this.state.dialog.messages.map(item => {
                            return <div>
                            </div>
                        })}
                    </div>
                </div>
                <div className={'user-center-container'} style={{padding: '50px 0'}}>
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