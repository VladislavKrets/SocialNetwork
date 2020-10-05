import React from "react";
import {Redirect, Route} from "react-router";
import Auth from "../../panels/Auth/Auth";
class PrivateRoute extends React.Component {
    render() {
        return <Route {...this.props}>
            {
                !this.props.token ? <Redirect to="/auth" /> :
                  <>
                    {this.props.children}
                  </>
              }
        </Route>
    }
}
export default PrivateRoute