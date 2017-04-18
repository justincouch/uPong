import { Meteor } from 'meteor/meteor';
import '../imports/api/db.js';
import { UI_DB } from '../imports/api/db.js';

var db_items = [
  "score",
  "redPlayer",
  "bluePlayer",
  "triggers"
];

Meteor.startup(() => {

  // make sure database has the right items
  var obj = {};
  for ( i in db_items ){
    console.log("CHECKING FOR: ");
    console.log("  " + db_items[i] + " in database");
    obj = UI_DB.findOne({ "name":db_items[i] });
    if ( obj === undefined ){
      console.log( "  " + db_items[i] + " NOT FOUND.");
      console.log( "   Creating..." );
      obj = {};
      obj.name = db_items[i];
      obj.label = "";
      obj.value = 0;

      if ( obj.name === "score" ){
        obj.red = 0;
        obj.blue = 0;
      }
      Meteor.call( "ui_db.insert", obj );
    }
    else {
      console.log("  " + db_items[i] + " found in database");
      if ( obj.name === "score" ){
        obj.red = 0;
        obj.blue = 0;
        Meteor.call( "ui_db.update", obj );
      } 
    }
  }


  // code to run on server at startup
  Meteor.onConnection( function socket_onConnection(obj){
    console.log("socket connected");
    console.log(obj.id, obj.clientAddress);
    // console.log(obj.onClose);
    // obj.onClose = function onClose(d){
    //   console.log("socket closed");
    //   console.log(d);
    // }
  })
});
