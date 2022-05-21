import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
  constructor(){
    super() 
    this.data = [{
        "username": "richard",
        "email": "richard@sample.com",
        "age": 20
        },
        {
        "username": "michael",
        "email": "michael@sample.com",
        "age": 23
        },
        {
        "username": "diego",
        "email": "diego@sample.com",
        "age": 24
        },
        {
        "username": "rene",
        "email": "rene@sample.com",
        "age": 22
        },
        {
        "username": "agustin",
        "email": "agustin@sample.com",
        "age": 32
        }
    ];

    this.state = {
      data: []
    }

    this.handleSearch = this.handleSearch.bind(this); 
    this.handleSortByAsc = this.handleSortByAsc.bind(this);
    this.handleSortByDesc = this.handleSortByDesc.bind(this);
  }
  
  componentDidMount(){
    this.setState({data:this.data})
  }

  handleSearch(e) {
    let curList = [];
    let newList = []; 
    if(e.target.value != "") {
      curList = this.data; 
      newList = curList.filter(item => {
        const lc = item.username.toLowerCase(); 
        const filter = e.target.value.toLowerCase(); 
        return lc.includes(filter); 
      }); 
    }
    else  {
      newList = this.data;
    }
    this.setState({
      data: newList
    }); 
  }

  handleSortByAsc(e) {
    let newList = this.data; 
    newList.sort(function(a, b) {
      if (a.username > b.username)
        return 1; 
      else if (a.username < b.username) 
        return -1; 
      else 
        return 0; 
    }); 
    this.setState({
      data: newList
    }); 
  }

  handleSortByDesc(e) {
    let newList = this.data; 
    newList.sort(function(a, b) {
      if (a.username > b.username)
        return 1; 
      else if (a.username < b.username) 
        return -1; 
      else 
        return 0; 
    }); 
    this.setState({
      data: newList
    }); 
  }
  
  render() {
    return (
      <div>
        <h1>Test - ReactJS</h1>
        <input type="text" onChange={this.handleSearch} placeholder="search...."/>
        <button onClick={this.handleSortByAsc}>Sort Asc</button>
        <button onClick={this.handleSortByDesc}>Sort Desc</button>
        <table>
          <thead>
            <tr>
              <th>User name</th>
              <th>Email</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {this.state.data.map(function(item, key){
              return (
                <tr key = {key}>
                  <td>{item.username}</td>
                  <td>{item.email}</td>
                  <td>{item.age}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )

  }
}

export default App;
