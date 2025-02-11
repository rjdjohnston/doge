const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  slug: String,
  name: String,
  data: mongoose.Schema.Types.Mixed,
  lastUpdated: Date
});

const titleSchema = new mongoose.Schema({
  titleNumber: String,
  agencySlug: String,
  data: mongoose.Schema.Types.Mixed,
  versions: [{ date: Date, data: mongoose.Schema.Types.Mixed }],
  wordCounts: {
    total: Number,
    subtitles: { type: Map, of: Number },
    chapters: { type: Map, of: Number },
    sections: { type: Map, of: Number }
  },
  lastUpdated: Date
});

const searchResultSchema = new mongoose.Schema({
  query: String,
  dateRange: {
    from: Date,
    to: Date
  },
  agencySlug: String,
  results: mongoose.Schema.Types.Mixed,
  lastUpdated: Date
});

module.exports = {
  Agency: mongoose.model('Agency', agencySchema),
  Title: mongoose.model('Title', titleSchema),
  SearchResult: mongoose.model('SearchResult', searchResultSchema)
}; 