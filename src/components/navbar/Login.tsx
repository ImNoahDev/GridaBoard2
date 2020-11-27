import React, { useEffect, useState } from 'react';
import { GoogleLogin } from 'react-google-login';
import { GoogleLogout  } from 'react-google-login';
import $ from 'jquery';
import Upload from './Upload';

const clientId = '199553124799-fsa01ovuea7v855aglpjp000qd73h63q.apps.googleusercontent.com';

const Login = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // User data
    const [user, setUser] = useState({name: "", email: "", image: ""})

    // Response
    const responseGoogle = async (response) => {

        const profile = await response.getBasicProfile()

        // Get Name
        console.log(profile.getName())

        // Get Image
        console.log(profile.getImageUrl())

        // Get Email
        console.log(profile.getEmail())

        // Set User
        setUser({
            name: profile.getName(),
            email: profile.getEmail(),
            image: profile.getImageUrl()
        })
    }

    // Logout
    const logout = () => {
        setUser({name: "", email: "", image: ""})
        setIsAuthenticated(false)
    }
    
    useEffect(() => {
        // Condition when user is not empty
        if (user.email.length > 0 || user.name.length > 0) {
            setIsAuthenticated(true);
        }
    }, [user])

    return (
        <div className="Test">
            <section>
                {isAuthenticated ? <AuthenticatedView logout={logout} user={user} /> : <UnAuthenticatedView responseGoogle={responseGoogle}/>}
            </section>
        </div>
    )
}

const AuthenticatedView = ({ user, logout }) => {
    return (
        <div>
            {/* <img className="authenticated_avatar" src={user.image} alt="avatar"/> */}
            <strong className="authenticated_name">{user.name}</strong>
            {/* <small className="authenticated_email">{user.email}</small> */}
            &nbsp;
            <GoogleLogout
                clientId={clientId}
                buttonText="Logout"
                onLogoutSuccess={logout}
            >
            </GoogleLogout> 
            {/* <Upload /> */}
        </div>
    )
}

const UnAuthenticatedView = ({ responseGoogle }) => {
    return (
        <div style={{ margin: "auto" }}>
            <GoogleLogin
                clientId={clientId}
                buttonText="Login"
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
                isSignedIn={true}
                cookiePolicy={'single_host_origin'}    
            />
            
        </div>
    )
}

export default Login;

// $(document).ready(function () {
//     // client id of the project
  
//     var clientId =
//       '199553124799-fsa01ovuea7v855aglpjp000qd73h63q.apps.googleusercontent.com';
  
//     // redirect_uri of the project
  
//     var redirect_uri = 'http://localhost:3000/';
  
//     // scope of the project
  
//     var scope = 'https://www.googleapis.com/auth/drive';
  
//     // the url to which the user is redirected to
  
//     var url = '';
  
//     // this is event click listener for the button
  
//     $('#login').click(function () {
//       // this is the method which will be invoked it takes four parameters
  
//       signIn(clientId, redirect_uri, scope, url);
//     });
  
//     function signIn(clientId, redirect_uri, scope, url) {
//       // the actual url to which the user is redirected to
  
//       url =
//         'https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=' +
//         redirect_uri +
//         '&prompt=consent&response_type=code&client_id=' +
//         clientId +
//         '&scope=' +
//         scope +
//         '&access_type=offline';
  
//       // this line makes the user redirected to the url
  
//       window.location = url;
//     }
//   });

//   class Login extends React.Component {
//       render() {
//           return (
//             <div>
//                 <button id="login">
//                     Upload Files to Drive
//                 </button>
//                 <Upload />
//             </div> 
//           )
//       }
//   }

  // export default Login;