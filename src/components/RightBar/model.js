/**
 * Created by danielhuang on 4/15/18.
 */
import AllInformants from '../../data/allinformants.json';

const realPeopleData = arrOfObjToObj(AllInformants,'person_id');

export function arrayTransformation(item){
    var finalArray=[];
    if(Array.isArray(item)){
        finalArray = item;
    } else if(typeof item === 'object'){
        finalArray.push(item);
    }
    //if item is undefined (meaning there's no people/stories/places associated) then return empty array
    return finalArray;
}

export function getPeopleByID(person_id){
    var personObject = realPeopleData[person_id];
    if(personObject['places'] !== null && personObject['stories']!==null){
        personObject['places'] = arrayTransformation(personObject['places'].place);
        personObject['stories'] = arrayTransformation(personObject['stories'].story)
    }

    return realPeopleData[person_id];
}

function arrOfObjToObj(arrOfObj, id){
    var resultObj = {};

    arrOfObj.forEach((obj) => {
        resultObj[obj[id]] = obj;
    });
    return resultObj;
}