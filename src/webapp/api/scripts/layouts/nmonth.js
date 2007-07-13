/******************************************************************************
 * NMonthLayout
 * @fileoverview
 *   This is where the monthly layout is defined.  The layout is designed to 
 *   resemble the equivalent Google Calendar view.
 * @author masont
 *****************************************************************************/

Timegrid.NMonthLayout = function(eventSource, params) {
    Timegrid.NMonthLayout.superclass.call(this, eventSource, params);
    this.title = "Month";
    this.xSize = 7;
    this.ySize = 5;
    this.iterable = false;
    
    this.configure(params);
    
    // Compute the cell sizes for the grid
    this.computeCellSizes();

    // Initialize our eventSource
    this.eventSource = eventSource;
    this.startTime = this.eventSource.getEarliestDate();
    this.startTime = Timegrid.NMonthLayout.getStartOfMonth(this.startTime);
    this.endTime   = Timegrid.NMonthLayout.getEndOfMonth(this.startTime);
    
    // Configure our mappers
    if (this.startTime) { var firstWeek = this.startTime.getWeekOfYear(); }
    this.xMapper = function(obj) { return obj.time.getDay(); };
    this.yMapper = function(obj) { return obj.time.getWeekOfYear() - firstWeek; };
    
    this.initializeGrid();
};
Timegrid.LayoutFactory.registerLayout("n-month", Timegrid.NMonthLayout);

Timegrid.NMonthLayout.prototype.initializeGrid = function() {
    this.eventGrid = new Timegrid.Grid([], this.xSize, this.ySize, 
                                       this.xMapper, this.yMapper);
    if (this.startTime) {
        var iterator = this.eventSource.getEventIterator(this.startTime,
                                                         this.endTime);
        while (iterator.hasNext()) {
            var endpoints = Timegrid.NMonthLayout.getEndpoints(iterator.next());
            this.eventGrid.addAll(endpoints);
        }
    }
};

Timegrid.NMonthLayout.prototype.renderEvents = function(doc) {
    var eventContainer = doc.createElement("div");
    $(eventContainer).addClass("timegrid-events");
    var i = 0;
    var dates = this.getDates(this.startTime);
    for (y = 0; y < this.ySize; y++) {
        for (x = 0; x < this.xSize; x++) {
            var endpoints = this.eventGrid.get(x,y);
            var events = $.map(endpoints, function(e) { 
                return e.type == "start" ? e.event : null;
            });
            var n = dates[i];
            eventContainer.appendChild(this.renderEventList(events, x, y, n));
            i++;
        }
    }
    return eventContainer;
};

Timegrid.NMonthLayout.prototype.renderEventList = function(evts, x, y, n) {
    var jediv = $("<div></div>").addClass("timegrid-month-cell");
    var eList = $("<ul></ul>").addClass("timegrid-event-list");
    for (i in evts) {
        eList.append('<li>' + evts[i].getText() + '</li>');
    }
    jediv.append(eList);
    jediv.append('<span class="timegrid-month-date-label">' + n + '</span>');
    jediv.css("height", this.yCell).css("width", this.xCell + "%");
    jediv.css("top", this.yCell * y);
    jediv.css("left", this.xCell * x + '%');
    return jediv.get()[0]; // Return the actual DOM element
};

Timegrid.NMonthLayout.prototype.getXLabels = function() {
    return Date.dayNames;
};

Timegrid.NMonthLayout.prototype.getYLabels = function() {
    return [ "Week 1", "Week 2", "Week 3", "Week 4", "Week 5" ];
};

Timegrid.NMonthLayout.prototype.getDates = function(date) {
    var gridStart = { time: new Date(date) };
    var dates = [];
    // Roll back to the first day on the grid
    while (this.xMapper(gridStart) > 0 && this.yMapper(gridStart) >= 0) {
        gridStart.time.setHours(-24);
    }
    // Iterate through and collect the tasty data
    while (this.xMapper(gridStart) < this.xSize && 
           this.yMapper(gridStart) < this.ySize) {
        dates.push(gridStart.time.getDate());
        gridStart.time.setHours(24);
    }
    return dates;
};

Timegrid.NMonthLayout.getEndpoints = function(evt) {
    return [ { type: "start",
               time: evt.getStart(),
               event: evt },
             { type: "end",
               time: evt.getEnd(),
               event: evt } ];
};

Timegrid.NMonthLayout.getStartOfMonth = function(date) {
    if (date) {
        var startTime = new Date(date);
        startTime.setDate(1);
        startTime.setHours(0);
        return startTime;
    }
};


Timegrid.NMonthLayout.getEndOfMonth = function(date) {
    if (date) {
        var endTime = new Date(date);
        endTime.setDate(endTime.getDaysInMonth());
        endTime.setHours(24);
        return endTime;
    }
    return false;
};
