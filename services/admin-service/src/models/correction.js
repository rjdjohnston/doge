const mongoose = require('mongoose');

const hierarchySchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  chapter: String,
  subchapter: String,
  part: String,
  subpart: String,
  section: String,
  subject_group: String
}, { _id: false });

const cfrReferenceSchema = new mongoose.Schema({
  cfr_reference: String,
  hierarchy: hierarchySchema
}, { _id: false });

const correctionSchema = new mongoose.Schema({
  id: Number,
  cfr_references: [cfrReferenceSchema],
  corrective_action: String,
  error_corrected: Date,
  error_occurred: Date,
  fr_citation: String,
  position: Number,
  display_in_toc: Boolean,
  title: Number,
  year: Number,
  last_modified: Date
});

module.exports = mongoose.model('Correction', correctionSchema); 