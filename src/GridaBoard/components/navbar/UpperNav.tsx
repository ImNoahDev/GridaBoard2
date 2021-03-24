import React from 'react';
import '../../styles/main.css';
import Upload from './Upload';
// import Get from './Get';

class upperNav extends React.Component {
    render() {
        return (
            <nav id="uppernav" className="navbar navbar-light bg-transparent" style={{float: "left"}}>
                {/* <a id="grida_board" className="navbar-brand" href="#">Grida board */}
                    <small id="neo_smartpen" className="text-muted">
                        <span data-l10n-id="by_neosmart_pen"> by Neo smartpen</span>
                    </small>
                {/* </a> */}
                <Upload />
            </nav>
        )
    }
}

export default upperNav;