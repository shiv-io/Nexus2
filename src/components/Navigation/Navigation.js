/**
 * Created by danielhuang on 2/24/18.
 */
import React, { Component } from 'react';
import NavigatorComponent from './NavigatorComponent';
import SearchComponent from './SearchComponent';
import MapView from '../MapView/MapView';
import {ontologyToDisplayKey, ontologyToID, dateFilterHelper, getPlaces} from './model';
import './navigation.css'
import UserNexus from "../UserNexus/UserNexus";

class Navigation extends Component {

    constructor(){
        super();
        this.state = {
            path:[],
            //lists visible on view
            lists:[
                {
                    name:'MAIN',
                    childArray:['Data Navigator','Topic & Index Navigator','[Select]'],
                    children:[this['Data Navigator'],this['Topic & Index Navigator']],
                    level:0
                },
            ],
            displayItemsList:[],
            itemsList:[],
            fromDate:1887, //default start date
            fromSelect:false,
            toDate: 1899, //default end date
            toSelect:false,
            timeFilterOn:false,
            displayOntology:'',
            lastIDKey:'',
            lastDisplayKey:'',
            placeList:[],
            fieldtrips:[],
            nodes:[],
        };
        this.displayItems = this.displayItems.bind(this)
    }

    componentWillMount(){
        const cachedState = localStorage.getItem('state');
        if(cachedState && localStorage.getItem('lastIDKey') !== 'undefined'){
            const path = localStorage.getItem('path');
            const lists = localStorage.getItem('lists');
            const itemsList = localStorage.getItem('itemsList');
            const fromDate = localStorage.getItem('fromDate');
            const toDate = localStorage.getItem('toDate');
            const fromSelect = localStorage.getItem('fromSelect');
            const toSelect = localStorage.getItem('toSelect');
            const displayOntology = JSON.parse(localStorage.getItem('displayOntology'));
            const lastIDKey = JSON.parse(localStorage.getItem('lastIDKey'));
            const lastDisplayKey = JSON.parse(localStorage.getItem('lastDisplayKey'));

            this.setState({
                path:JSON.parse(path),
                lists:JSON.parse(lists),
                displayOntology:displayOntology,
                itemsList:JSON.parse(itemsList),
                lastIDKey:lastIDKey,
                lastDisplayKey:lastDisplayKey,
                displayItemsList:JSON.parse(itemsList).map((itemInList,i)=>{
                    return <li key={i} className={displayOntology}
                               onClick={(e)=>{ e.preventDefault();
                                   this.handleIDQuery(itemInList[lastIDKey],itemInList[lastDisplayKey],displayOntology,itemInList)}}>
                        <span>
                            <img className={"convo-icon " + displayOntology} src={require('./icons8-chat-filled-32.png')} alt="story"/>
                            <img className={"person-icon " + displayOntology} src={require('./icons8-contacts-32.png')}  alt="person"/>
                            <img className={"location-icon " + displayOntology} src={require('./icons8-marker-32.png')}  alt="location"/>
                        </span> {itemInList[lastDisplayKey]}
                    </li>
                }),
                fromDate:JSON.parse(fromDate),
                toDate:JSON.parse(toDate),
                fromSelect:JSON.parse(fromSelect),
                toSelect:JSON.parse(toSelect),
            });
        }
    }

    displayList(list, displayKey, idKey, ontology){

        this.setState((prevState)=>{
            return {
                displayItemsList: list.map((itemInList,i)=>{
                    return <li key={i} className={prevState.displayOntology}
                               onClick={(e)=>{ e.preventDefault();
                                   this.handleIDQuery(itemInList[idKey],itemInList[displayKey],this.state.displayOntology,itemInList)}}>
                        <span>
                            <img className={"convo-icon " + ontology} src={require('./icons8-chat-filled-32.png')} alt="story"/>
                            <img className={"person-icon " + ontology} src={require('./icons8-contacts-32.png')}  alt="person"/>
                            <img className={"location-icon " + ontology} src={require('./icons8-marker-32.png')}  alt="location"/>
                        </span> {itemInList[displayKey]}
                    </li>
                }),
                lastIDKey:idKey,
                lastDisplayKey:displayKey,
            }
        });
        if(ontology === 'undefined'){
            console.log('ontology is undefined');
            return list.map((item,i)=>{

                return <li key={i} className={this.state.displayOntology}
                           onClick={(e)=>{ e.preventDefault();
                               this.handleIDQuery(item[idKey],item[displayKey],this.state.displayOntology,item)}}>
                    <span>
                        <img className={"convo-icon " + ontology} src={require('./icons8-chat-filled-32.png')} alt="story"/>
                        <img className={"person-icon " + ontology} src={require('./icons8-contacts-32.png')}  alt="person"/>
                        <img className={"location-icon " + ontology} src={require('./icons8-marker-32.png')}  alt="location"/>
                    </span> {item[displayKey]}
                </li>
            });
        } else {
            console.log('ontology is defined');
            return list.map((item,i)=>{
                return <li key={i} className={ontology}
                           onClick={(e)=>{ e.preventDefault();
                               this.handleIDQuery(item[idKey],item[displayKey],ontology,item)}}>
                    <span>
                        <img className={"convo-icon " + ontology} src={require('./icons8-chat-filled-32.png')} alt="story"/>
                        <img className={"person-icon " + ontology} src={require('./icons8-contacts-32.png')}  alt="person"/>
                        <img className={"location-icon " + ontology} src={require('./icons8-marker-32.png')}  alt="location"/>
                    </span> {item[displayKey]}
                </li>
            });
        }
    }

    handleIDQuery(id, name, type, item){
        console.log(id,name,type, item);
        // add node to this.state.nodes
        this.setState((oldState)=>{

            var newState = oldState,
                nodeColor='';

            switch(type){
                case 'People':
                    nodeColor = 'blue';
                    break;
                case 'Places':
                    nodeColor = 'red';
                    break;
                case 'Stories':
                    nodeColor = 'grey';
            }
            var newNode = {
                id:name,
                color:nodeColor,
                item:item,
                type:type,
                itemID:id,
            };
            // newState['nodes'].push(newNode);
            this.refs.UserNexus.updateNetwork(newNode);

            return {
                nodes:newState['nodes'],
            }
        }, () =>{
            this.props.addID(id,name,type);
        });

        // this.refs.UserNexus.updateNetwork(name, item, type);
        // this.props.addID(id,name,type);
    }

    setPlaceIDList(items, ontology){
        console.log(ontology);
        if(ontology!=='Places'){

            if(ontology==='Fieldtrips'){this.setState({fieldtrips:items})}

            //list must only contain stories, for each story get the place_recorded id
            var PlaceIDList = [];
            items.forEach((item)=>{
                if(item['place_recorded'] && typeof item['place_recorded'] === 'object'){
                    PlaceIDList.push(item['place_recorded']['id']);
                }
            });

            var PlaceList = getPlaces(PlaceIDList);

            this.setState({placeList:PlaceList})
        }else{
            this.setState({placeList:items})
        }
    }

    displayItems(items, ontology){
        var displayKey = ontologyToDisplayKey[ontology];
        var idKey = ontologyToID[ontology];

        this.setPlaceIDList(items,ontology);
        console.log(ontology);

        /*Save items to local storage for data to continue to exist after tab switch/page refresh  */
        localStorage.setItem('state', JSON.stringify(this.state));
        localStorage.setItem('path', JSON.stringify(this.state['path']));
        localStorage.setItem('lists', JSON.stringify(this.state['lists']));
        localStorage.setItem('itemsList', JSON.stringify(items));
        localStorage.setItem('fromDate', JSON.stringify(this.state['fromDate']));
        localStorage.setItem('toDate', JSON.stringify(this.state['toDate']));
        localStorage.setItem('fromSelect', JSON.stringify(this.state['fromSelect']));
        localStorage.setItem('toSelect', JSON.stringify(this.state['toSelect']));
        localStorage.setItem('displayOntology', JSON.stringify(ontology));
        localStorage.setItem('lastIDKey', JSON.stringify(idKey));
        localStorage.setItem('lastDisplayKey',JSON.stringify(displayKey));
        localStorage.setItem('timeFilterOn',JSON.stringify(this.state['timeFilterOn']));
        this.setState(()=>{
            return {
                displayOntology:ontology,
                itemsList:items,
                displayItemsList: this.displayList(items,displayKey,idKey,ontology)
            }
        },()=>{
            if(this.state.timeFilterOn && typeof items !== 'undefined'){
                this.updateItems.bind(this)()
            }
        });
    }

    updateItems(){
        var displayKey = ontologyToDisplayKey[this.state.displayOntology];
        var idKey = ontologyToID[this.state.displayOntology];
        if(this.state.timeFilterOn){
            //filter by time
            var itemsWithinFieldtrips = dateFilterHelper(this.refs.fromDate.value, this.refs.toDate.value,this.state.displayOntology);
            //if an item is in the itemsWithinFieldtrips, change what is displayed, NOT items list
            var displayList = [];
            //if it isn't a fieldtrip
            if(this.state.displayOntology !== 'Fieldtrips'){
                var idsWithinFieldtrips = [];
                if(typeof itemsWithinFieldtrips !== 'undefined'){
                    itemsWithinFieldtrips.forEach((item)=>{
                        idsWithinFieldtrips.push(item[idKey]);
                    });
                    this.state.itemsList.forEach((item)=>{
                        //if something in the current items list is in the range of the date
                        if(idsWithinFieldtrips.indexOf(item[idKey]) > -1){
                            displayList.push(item);
                        }
                    });
                    this.setState({
                        displayItemsList:this.displayList(displayList,displayKey,idKey,'undefined')
                    })
                }
            } else { //else it is a fieldtrip
                this.setState({
                    displayItemsList:this.displayList(itemsWithinFieldtrips,displayKey,idKey,'Fieldtrips')
                })
            }
        } else if(!this.state.timeFilterOn) {
            this.setState({
                displayItemsList:this.displayList(this.state.itemsList,displayKey,idKey,'undefined')
            })
        }

    }

    //sets time filters
    timeFilterHandler(){
        var fromDateForm = parseInt(this.refs.fromDate.value);
        var toDateForm = parseInt(this.refs.toDate.value);
        //check if the dates are valid dates (4 digits, between 1887 and 1899)
        if( fromDateForm >= 1887 && toDateForm <= 1899){
            //check if time filter was switched
            if(this.refs.TimeFilterOn.checked !== this.state.timeFilterOn){
                //if they are, then set this.state variables
                this.setState({
                    timeFilterOn:!this.state.timeFilterOn,
                    fromDate:fromDateForm,
                    toDate:toDateForm,
                }, ()=>{
                    this.updateItems.bind(this)()
                })
            } else {
                //just change from/to dates
                this.setState({
                    fromDate:fromDateForm,
                    toDate:toDateForm,
                }, ()=>{
                    this.updateItems.bind(this)()
                })
            }
        }
    }

    timeInputClickHandler(year){
        //display slider
        if(year === 'ToYear'){
            //set this.state.toSelect = true
            this.setState(()=>{return {toSelect:true}});
        } else {
            //set this.state.fromSelect = true
            this.setState(()=>{return {fromSelect:true}});
        }
    }

    timeInputEnd(year){
        console.log(this.refs.fromDate.value);
        //display slider
        if(year === 'toDate'){
            //set this.state.toSelect = true
            this.setState(()=>{return {toSelect:false}},
                ()=>{this.timeFilterHandler.bind(this)});
        } else {
            //set this.state.fromSelect = true
            this.setState(()=>{return {fromSelect:false}},
                ()=>{this.timeFilterHandler.bind(this)});
        }
    }

    render() {
        return (
            <div className="Navigation">
                <div className="navigation grid-x grid-padding-x">
                    <div className="medium-3 cell dataNavigation">
                        <div>
                            <SearchComponent handleDisplayItems={this.displayItems.bind(this)}/>
                            <NavigatorComponent handleDisplayItems={this.displayItems.bind(this)}/>
                        </div>
                    </div>
                    <div className="medium-5 cell AssociatedStoriesViewer">
                        <div className="grid-y" style={{'height':'100%'}}>
                            <div className="cell medium-2">
                                <form className="time-filter grid-x">
                                    <div className="medium-2 cell text"><b>From</b></div>
                                    <div className="medium-2 cell">
                                        <input className="year" type="text" name="FromYear" ref="fromDate"
                                               value={this.state.fromDate}
                                               onChange={this.timeFilterHandler.bind(this)} onClick={(e)=>{ e.preventDefault();
                                            this.timeInputClickHandler.bind(this)('FromYear')}}/>
                                        <input className={`slider ${this.state.fromSelect ? 'active' : '' }`}
                                               type="range" min="1887" max={this.state.toDate} value={this.state.fromDate}
                                               onChange={this.timeFilterHandler.bind(this)}
                                               onMouseUp={(e)=>{e.preventDefault(); this.timeInputEnd.bind(this)('fromDate')}}
                                               ref="fromDate"
                                               id="myRange"/>
                                    </div>
                                    <div className="medium-1 cell text"><b>To</b></div>
                                    <div className="medium-2 cell">
                                        <input className="year" type="text" name="ToYear" ref="toDate"
                                               value={this.state.toDate}
                                               onChange={this.timeFilterHandler.bind(this)} onClick={(e)=>{ e.preventDefault();
                                            this.timeInputClickHandler.bind(this)('ToYear')}}/>
                                        <input className={`slider ${this.state.toSelect ? 'active' : '' }`}
                                               type="range" min={this.state.fromDate} max="1899" value={this.state.toDate}
                                               onChange={this.timeFilterHandler.bind(this)}
                                               onMouseUp={(e)=>{e.preventDefault(); this.timeInputEnd.bind(this)('toDate')}}
                                               ref="toDate"
                                               id="myRange"/>
                                    </div>
                                    <div className="medium-3 medium-offset-1 cell">
                                        <div className="switch">
                                            <input className="switch-input" id="exampleSwitch" type="checkbox" checked={this.state.timeFilterOn}
                                                   name="exampleSwitch" onChange={this.timeFilterHandler.bind(this)} ref="TimeFilterOn"/>
                                            <label className="switch-paddle" htmlFor="exampleSwitch"><br/>
                                                <span style={{fontSize:".8em",color:'black',width:'150%'}}>Timeline</span>
                                                <span className="show-for-sr">Enable Timeline</span>
                                            </label>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="stories-container cell medium-10">
                                <ul className="book medium-cell-block-y">
                                    {this.state.displayItemsList}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="medium-4 cell">
                        <div className="grid-y" style={{'height':'100%'}}>
                            <UserNexus className="medium-6 cell" nodes={this.state.nodes} ref="UserNexus"/>
                            <MapView className="medium-6 cell" places={this.state.placeList} fieldtrips={this.state.fieldtrips}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Navigation;