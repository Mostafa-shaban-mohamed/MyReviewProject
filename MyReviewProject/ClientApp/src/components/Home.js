import React, { Component } from 'react';

export class Home extends Component {
  static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = {
            i: 0,
            txt: `is website to write your own review
                    on Products,
                    Movies,
                    TV Shows,
                    Cars
                    or Anything You Want.`, /* The text */
            speed: 50,
            isShow: false
        };

        this.typeWriter = this.typeWriter.bind(this);
    }

    componentDidMount() {
        this.typeWriter();
    }

    async typeWriter() {
        if (document.getElementById("startBtn") !== null) {
            document.getElementById("startBtn").style.visibility = "hidden";
            if (this.state.i < this.state.txt.length) {
                document.getElementById("demo").innerHTML += this.state.txt.charAt(this.state.i);
                this.setState({
                    i: this.state.i + 1
                });
                setTimeout(this.typeWriter, this.state.speed);
            } else {
                document.getElementById("startBtn").style.visibility = "visible";
                document.getElementById("startBtn").className += " " + "fade-In";
            }
        }
    }
        

    render() {

        return (
            <div className="HomePage">
                <h1>My Review</h1>
                <h2 id="demo"></h2>
                <div id="startBtn" className="getStart">
                    <a className="btn-rev" href="/Review">Start Reviewing</a>
                </div>
            </div>
    );
  }
}
