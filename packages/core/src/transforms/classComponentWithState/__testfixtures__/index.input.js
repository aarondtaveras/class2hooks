import React, { Component } from "react"

class SimpleComponents extends Component {
  constructor(props){
    super(props);
    this.state = {
      count: 0
    };
  }
  render() {
    return (
      <div>
        <p> You clicked {this.state.count} times.</p>
      </div>
    )
  }
}

export default SimpleComponents
