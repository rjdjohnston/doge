These are the initial prompts I used to get the code base setup. 
One hour on prompts and 15 hours working through reqs and adjustments with AI
Five hours manually on code and deployment

Could have done this manually without the architecture and design. I thought it was important to demonstrate
my knowledge in technical architure. With more time, I would have added a service layer with supporting 
discovery, monitoring, logging, and scale. 
I wanted to try and see how much I could get done with AI in the time alloted. Hopefully this is not viewed as a negative. 

## Admin Endpoints

All Agencies
https://www.ecfr.gov/api/admin/v1/agencies.json
params: none

All ecfr corrections
https://www.ecfr.gov/api/admin/v1/corrections.json
params: date (string), title (string), error_corrected_Date (string)

Corrections by title
https://www.ecfr.gov/api/admin/v1/corrections/title/{title}.json
params: title (string)

## Search endpoints

Search results
https://www.ecfr.gov/api/search/v1/results
params: query (string), agency_slugs (array[string]), date (string) format: YYYY-MM-DD, last_modified_after (string) format: YYYY-MM-DD, last_modified_on_or_after (string) format: YYYY-MM-DD, last_modified_before (string) format: YYYY-MM-DD, last_modified_on_or_before (string) format: YYYY-MM-DD, per_page (int), page (int), order (string), paginate_by (string)

Search result count
https://www.ecfr.gov/api/search/v1/count
params: query (string), agency_slugs (array[string]), date (string) format: YYYY-MM-DD, last_modified_after (string) format: YYYY-MM-DD, last_modified_on_or_after (string) format: YYYY-MM-DD, last_modified_before (string) format: YYYY-MM-DD, last_modified_on_or_before (string) format: YYYY-MM-DD

Search summary details
https://www.ecfr.gov/api/search/v1/summary
params: query (string), agency_slugs (array[string]), date (string) format: YYYY-MM-DD, last_modified_after (string) format: YYYY-MM-DD, last_modified_on_or_after (string) format: YYYY-MM-DD, last_modified_before (string) format: YYYY-MM-DD, last_modified_on_or_before (string) format: YYYY-MM-DD

Search result count by date
https://www.ecfr.gov/api/search/v1/counts/daily
params: query (string), agency_slugs (array[string]), date (string) format: YYYY-MM-DD, last_modified_after (string) format: YYYY-MM-DD, last_modified_on_or_after (string) format: YYYY-MM-DD, last_modified_before (string) format: YYYY-MM-DD, last_modified_on_or_before (string) format: YYYY-MM-DD

Search result count by title
https://www.ecfr.gov/api/search/v1/counts/titles
params: query (string), agency_slugs (array[string]), date (string) format: YYYY-MM-DD, last_modified_after (string) format: YYYY-MM-DD, last_modified_on_or_after (string) format: YYYY-MM-DD, last_modified_before (string) format: YYYY-MM-DD, last_modified_on_or_before (string) format: YYYY-MM-DD
```bash
{
  "titles": {
    "32": 177
  }
}```

Search result counts by hierarchy
https://www.ecfr.gov/api/search/v1/counts/hierarchy
params: query (string), agency_slugs (array[string]), date (string) format: YYYY-MM-DD, last_modified_after (string) format: YYYY-MM-DD, last_modified_on_or_after (string) format: YYYY-MM-DD, last_modified_before (string) format: YYYY-MM-DD, last_modified_on_or_before (string) format: YYYY-MM-DD

Search suggestions
https://www.ecfr.gov/api/search/v1/suggestions
params: query (string), agency_slugs (array[string]), date (string) format: YYYY-MM-DD, last_modified_after (string) format: YYYY-MM-DD, last_modified_on_or_after (string) format: YYYY-MM-DD, last_modified_before (string) format: YYYY-MM-DD, last_modified_on_or_before (string) format: YYYY-MM-DD

## Versioner Service

Returns self and all ancestors from a given title
https://www.ecfr.gov/api/versioner/v1/ancestry/{date}/title-{title}.json
params: date (string) format: YYYY-MM-DD, title (string), subtitle (string) format: uppercase, chapter (string) format: roman numerals and digits, subchapter (string) format: uppercase requires: chapter, part (string), subpart (string) requires: part, section (string) requires: part, appendix (string) requires: subtitle, chapter, or part 

Source XML for a title or subset of a title
https://www.ecfr.gov/api/versioner/v1/full/{date}/title-{title}.xml
params: date (string) format: YYYY-MM-DD, title (string), subtitle (string) format: uppercase, chapter (string) format: roman numerals and digits, subchapter (string) format: uppercase requires: chapter, part (string), subpart (string) requires: part, section (string) requires: part, appendix (string) requires: subtitle, chapter, or part 

Structure JSON for a title
https://www.ecfr.gov/api/versioner/v1/structure/{date}/title-{title}.json
params: date (string) format: YYYY-MM-DD, title (string)
```bash
{
  "content_versions": [
    {
      "date": "2016-12-20",
      "amendment_date": "2016-12-20",
      "issue_date": "2016-12-22",
      "identifier": "2.1",
      "name": "§ 2.1   Purpose.",
      "part": "2",
      "substantive": true,
      "removed": false,
      "subpart": null,
      "title": "32",
      "type": "section"
    },
  ]
}```

Summary information on each title
https://www.ecfr.gov/api/versioner/v1/titles.json
params: none
```bash
{
  "titles": [
    {
      "number": 1,
      "name": "General Provisions",
      "latest_amended_on": "2022-12-29",
      "latest_issue_date": "2024-05-17",
      "up_to_date_as_of": "2025-02-06",
      "reserved": false
    },
  ]
}```


Array of all sections and appendices inside a title
https://www.ecfr.gov/api/versioner/v1/versions/title-{title}.json
params: date (string) format: YYYY-MM-DD, title (string), subtitle (string) format: uppercase, chapter (string) format: roman numerals and digits, subchapter (string) format: uppercase requires: chapter, part (string), subpart (string) requires: part, section (string) requires: part, appendix (string) requires: subtitle, chapter, or part 


Create a modern microservice based web application. Use nodejs for the microservices. Each API will have its own service. Use mongodb as a cache store and database to query. Cache results for 5 hours. Search APIs if no data is available. The front end will be in modern react/nextjs. Use docker as containers for each service and application. For the front end, create a search section on top. Provide input field for text search, provide two date fields (to and from), these will be used and presented when applicable. To date is default date of all queries.
On home display all agencies as clickable links and in drop down in search section.

This section didn't work at all lol
Once agency is clicked or selected, show list versioned titles available by date with a total count, provide a summary of the title and total corrections for the title. 
When click on title display show all ancestors clickable with versions, display all the subtitles, chapters, subchapters, par, subpart, section, display appendix. They should be displayed in expandable format to see the contents under. Make the other versions available through a dropdown that updates the page. 
Provide word counts for each field. 


Create a startup script to query and cache all available data when the application is initally built

The TitleDetails component with expandable sections
The Docker configuration
The remaining microservices
The API routes for the frontend

The Docker configuration to run these services
The API gateway to route requests to the appropriate service
Environment configuration files
Service health check endpoints

AI is a great "tool" - It in no way will replace development, architecture, and experience. 
At least not for now