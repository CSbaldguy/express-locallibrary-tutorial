const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema(
  {
    first_name: { type: String, require: true, maxLength: 100 },
    family_name: { type: String, required: true, maxLength: 100 },
    date_of_birth: { type: Date },
    date_of_death: { type: Date }
  },
);

// Virtual for author's full name
AuthorSchema
  .virtual('name')
  .get(function() { 
    return this.family_name + ', ' + this.first_name
  });

// Virtual for author's lifespan
AuthorSchema
  .virtual('lifespan')
  .get(function() {
    let lifetime_string = '';
    if (this.date_of_birth) {
      lifetime_string = DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED);
    }
    lifetime_string += ' - ';
    if (this.date_of_death) {
      lifetime_string += DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
    }
    return lifetime_string;
  });

// Virtual for authoer's URL
AuthorSchema.
  virtual('url')
  .get(function() {
    return '/catalog/author/' + this._id;
  });

AuthorSchema
  .virtual('date_of_birth_YYYY_MM_DD')
  .get(function() { 
    return DateTime.fromJSDate(this.date_of_birth).toISODate();
  });

  AuthorSchema
  .virtual('date_of_death_YYYY_MM_DD')
  .get(function() { 
    return DateTime.fromJSDate(this.date_of_death).toISODate();
  });

//Export model
module.exports = mongoose.model('Author', AuthorSchema);
