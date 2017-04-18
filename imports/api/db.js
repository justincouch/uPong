import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const UI_DB = new Mongo.Collection('ui_db');

Meteor.methods({
  'ui_db.insert'(obj){
    check(obj, Object);

    obj.createdAt = new Date();

    UI_DB.insert(obj);
  },
  'ui_db.update'(obj){
    check(obj, Object);

    obj.lastModifiedAt = new Date();

    UI_DB.update( {"_id":obj._id}, obj );
  },
  'ui_db.remove'(item_id){
    check(item_id, String);

    const item = UI_DB.findOne(item_id);
    UI_DB.remove(item_id);
  }
});