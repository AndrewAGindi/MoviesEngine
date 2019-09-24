import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import {
    BrowserRouter as Router,
    Route,
    NavLink as RouterNavLink,
    Switch,
    Redirect,
} from "react-router-dom";
import capitalize from 'capitalize';


class Search extends React.Component{
  constructor(props){
    super(props); 
      this.state={
        searchTerm:"",
        rows:"",
        movie:[],
        error:""
      }
    this.routeChange = this.routeChange.bind(this);  
  }


  routeChange() {
    var string = (this.state.searchTerm);
    string = capitalize.words(string);
    var i = 0;
    var string_len = string.length;
    for(i; i < string_len; i ++) {
      string = string.replace(" ", "_");
    }
    let path = "/movies/" + string;
    this.props.history.push(path);
  }


  searchHandler(e){
    this.setState({searchTerm:e.target.value})
      // console.log("rows",this.state.rows)
        {this.state.rows.filter(searchingFor(this.state.searchTerm)).map(item=>{
          console.log(item);
          // this.setState({rows:item})
        }
      )
    }
  }

  render() {
    return(
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
        <form>
          <h1>Enter a movie</h1>
            <input type="text"
              placeholder="Movie"
              value={this.state.searchTerm}
              onChange={this.searchHandler.bind(this)}
            />
            <Button type="submit" variant="dark" onClick={this.routeChange}>Search</Button>
        </form>
      </div>  
    );
  }
}
export default Search;