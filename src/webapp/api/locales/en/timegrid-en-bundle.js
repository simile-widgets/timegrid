

/* monthly-l10n.js */





if(!("l10n"in Timegrid.MonthLayout)){

Timegrid.MonthLayout.l10n={};

}





Timegrid.MonthLayout.l10n.makeTitle=function(n){return"Month";}

/* nday-l10n.js */





if(!("l10n"in Timegrid.NDayLayout)){

Timegrid.NDayLayout.l10n={mini:{}};

}





Timegrid.NDayLayout.l10n.makeTitle=function(n){return n+"-Day";}





Timegrid.NDayLayout.l10n.makeRange=function(d1,d2){

return d1.format(Timegrid.NDayLayout.l10n.startFormat)+" - "+

d2.format(Timegrid.NDayLayout.l10n.endFormat);

};





Timegrid.NDayLayout.l10n.xLabelFormat="E M/d";

Timegrid.NDayLayout.l10n.mini.xLabelFormat="e";





Timegrid.NDayLayout.l10n.yLabelFormat="ha";

Timegrid.NDayLayout.l10n.mini.yLabelFormat="h";





Timegrid.NDayLayout.l10n.startFormat="M/d/yyyy";





Timegrid.NDayLayout.l10n.endFormat="M/d/yyyy";





/* nmonth-l10n.js */





if(!("l10n"in Timegrid.NMonthLayout)){

Timegrid.NMonthLayout.l10n={};

}





Timegrid.NMonthLayout.l10n.makeTitle=function(n){return n+"-Month";}





Timegrid.NMonthLayout.l10n.makeRange=function(d1,d2){

var string=d1.format(Timegrid.NMonthLayout.l10n.startFormat);

if(d2){

string+=" - "+d2.format(Timegrid.NMonthLayout.l10n.endFormat);

}

return string;

};





Timegrid.NMonthLayout.l10n.xLabelFormat="";





Timegrid.NMonthLayout.l10n.yLabelFormat="Ww";





Timegrid.NMonthLayout.l10n.startFormat="MMM yyyy";





Timegrid.NMonthLayout.l10n.endFormat="MMM yyyy";

/* property-l10n.js */





if(!("l10n"in Timegrid.PropertyLayout)){

Timegrid.PropertyLayout.l10n={};

}





Timegrid.PropertyLayout.l10n.makeTitle=function(){return"Property";}





Timegrid.PropertyLayout.l10n.yLabelFormat="ha";







/* weekly-l10n.js */





if(!("l10n"in Timegrid.WeekLayout)){

Timegrid.WeekLayout.l10n={};

}





Timegrid.WeekLayout.l10n.makeTitle=function(n){return"Week";}

/* timegrid-l10n.js */





if(!("l10n"in Timegrid)){

Timegrid.l10n={};

}



Timegrid.l10n.loadingMessage="Loading...";



Timegrid.l10n.jsonErrorMessage="Failed to load JSON data from";



Timegrid.l10n.xmlErrorMessage="Failed to load XML data from";

/* date-l10n.js */





if(!("l10n"in Date)){

Date.l10n={};

}





Date.l10n.monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];





Date.l10n.monthAbbreviations=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];





Date.l10n.dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];





Date.l10n.dayAbbreviations=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];





Date.l10n.preferAmericanFormat=true;





Date.l10n.firstDayOfWeek=0;

