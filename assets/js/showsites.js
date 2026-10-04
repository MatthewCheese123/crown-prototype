/* Crown show sites and what's on display: THE ONE LIST (v8.9, 4 Oct 2026).
   Edit this file to change what each site shows. The booking form, the show-sites table, the site pages and the gazebos hub all read it.
   - models: the exact model names on display there (as written on the model pages, e.g. "Crown Hampton"). Leave [] if we don't know.
   - display: a short honest note shown beside the site (e.g. "Gazebos only"). Leave "" if there's nothing to say.
   - note: an extra line (e.g. where the video was filmed).
   v9.2 (4 Oct 2026): EXAMPLE DATA. The model lists below are made-up examples for the prototype (only "Crown Hampton" at Woburn Sands,
   Wickford and Bagshot came from the live site). Crown to replace them with what is really on display. Nothing on the site says "example".
   - gazebosOnly: true keeps garden-room visitors away from a site that shows gazebos only. */
window.CROWN_SHOWSITES={
  updated:"4 Oct 2026",
  sites:[
    {id:"bridgemere",   town:"Bridgemere",   county:"Cheshire", gc:"Bridgemere Garden Centre", addr:"Bridgemere, Nantwich, Cheshire CW5 7QB", pc:"CW5 7QB", wk:["09:00","17:00"], sun:["10:00","16:30"],
      display:"", gazebosOnly:true, models:["Crown Rose","Crown Tudor","Crown Wolsey"] /* example data */, note:"Gazebos only"},
    {id:"woburn-sands", town:"Woburn Sands", county:"Bucks",    gc:"Frosts Garden Centre", addr:"Newport Road, Woburn Sands, Buckinghamshire MK17 8UE", pc:"MK17 8UE", wk:["09:00","17:30"], sun:["10:30","16:30"],
      display:"", models:["Crown Hampton","Crown Eden","Heritage"] /* example data */, note:""},
    {id:"ware",         town:"Ware",         county:"Herts",    gc:"Van Hage Garden Centre", addr:"Great Amwell, Ware, Hertfordshire SG12 9RP", pc:"SG12 9RP", wk:["09:00","17:30"], sun:["10:00","16:30"],
      display:"", models:["Crown Chelsea","Crown Windsor","Crown Eden Glazed","Contemporary"] /* example data */, note:""},
    {id:"wickford",     town:"Wickford",     county:"Essex",    gc:"Alton Garden Centre", addr:"Arterial Road, Wickford, Essex SS12 9JG", pc:"SS12 9JG", wk:["09:00","17:00"], sun:["10:00","16:30"],
      display:"", models:["Crown Hampton","Crown Windsor","Crown Edward"] /* example data */, note:""},
    {id:"chessington",  town:"Chessington",  county:"Surrey",   gc:"Chessington Garden Centre", addr:"Leatherhead Road, Chessington, Surrey KT9 2NG", pc:"KT9 2NG", wk:["09:00","18:00"], sun:["09:30","16:30"],
      display:"", models:["Crown Ascot","Crown Orangery","Sandringham","St. Tropez"] /* example data */, note:"Video showcase filmed here"},
    {id:"bagshot",      town:"Bagshot",      county:"Surrey",   gc:"Longacres Garden Centre", addr:"London Road, Bagshot, Surrey GU19 5JB", pc:"GU19 5JB", wk:["08:30","17:30"], sun:["10:00","16:30"],
      display:"", models:["Crown Hampton","Crown Tudor","Crown Eden","Clarence"] /* example data */, note:""},
    {id:"home",  town:"At your home",  gc:"A design consultant visits your garden", addr:"", remote:true, wk:["10:00","16:00"], sun:null},
    {id:"video", town:"By video call", gc:"For 100+ miles from a site · filmed at Chessington", addr:"", remote:true, wk:["10:00","17:00"], sun:null}
  ],
  /* model name -> the line shown above the first booking choice ("Crown Rose · Classic · seats 2-4") */
  models:{
    "Crown Rose":"Classic · seats 2-4","Crown Chelsea":"Classic · seats 4-6","Crown Tudor":"Classic · seats 6-8","Crown Elizabeth":"Classic · seats 6-8",
    "Crown Guinevere":"Classic · seats 7-10","Crown Wolsey":"Classic · seats 8-10","Crown Edward":"Classic · seats 8-10","Crown Wentworth":"Classic · seats 11-14",
    "Crown Ascot":"Classic · seats 8","Crown Eden":"Classic · seats 8-10","Crown Windsor":"Classic · seats 10","Crown Orangery":"Classic · seats 12",
    "Crown Hampton":"Classic · seats 8-14","Crown Versailles":"Classic · seats 12-15",
    "Crown Eden Glazed":"Glazed · seats 8-10 · unfurnished","Crown Orangery Glazed":"Glazed · seats 10-12 · unfurnished","St. Tropez":"Glazed · 4.5m × 3m · unfurnished",
    "Crown Eden All-season":"All-season · seats 8-10 · unfurnished","Crown Orangery All-season":"All-season · seats 10-12 · unfurnished",
    "Tranquility":"Garden shelter","Horizon":"Garden shelter","Sunrise Carport":"Garden shelter","Oceania":"Garden shelter",
    "Sandringham":"Signature garden room","Clarence":"Signature garden room","Buckingham":"Signature garden room","Heritage":"Garden room collection","Contemporary":"Garden room collection"
  }
};
