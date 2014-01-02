//
// "String art" demo.  I originally implemented a demo similar to
// this in Flash Builder, to get a feel of those tools.  Seeing
// the same facilties in HTML5, I re-implemented it in
// HTML/JavaScript, using the JQueryUI framework.
//
// The graphics code came from ancient Tek 4010 demos
// I came across at OMSI many, many years ago.
//
// John Peterson, April 2012
//

// Define base class behavior for both graphic objects.
// The canvasName parameter should match the ID tag prefix
// used in the HTML.
function StringArt( canvasName )
{
    this.name = canvasName;
    this.canvas = $("#" + canvasName + "_canvas").get(0);
    this.dc = this.canvas.getContext('2d');
    this.dc.strokeStyle = "green";
    this.rp = new Point(0,0);
}

StringArt.prototype.clear = function()
{
    this.dc.fillStyle = "white";
    this.dc.fillRect( 0, 0, this.canvas.width, this.canvas.height );
}

// Polar coordinate based moveTo/lineTo functions
StringArt.prototype.pmoveTo = function( scale, angle, offset )
{
    this.rp.polar( scale, angle, offset );
    this.dc.moveTo( this.rp.x, this.rp.y );
}
    
StringArt.prototype.plineTo = function( scale, angle, offset )
{
    this.rp.polar( scale, angle, offset );
    this.dc.lineTo( this.rp.x, this.rp.y );
}
    
function Point( x, y )
{
    this.x = x;
    this.y = y;
}

// Set point to polar coords
Point.prototype.polar = function( scale, angle, offset )
{
    // Scale can be either a point or a plain number
    if (typeof scale == "number")
    {
        this.x = scale * Math.cos(angle) + offset.x;
        this.y = scale * Math.sin(angle) + offset.y;
    }
    else
    {
        this.x = scale.x * Math.cos(angle) + offset.x;
        this.y = scale.y * Math.sin(angle) + offset.y;
    }
}

// Code below is JQuery based.

$(function() {
    
    /////////////////////////
    // Torus-specific code
    /////////////////////////
    
    var Torus = new StringArt( "torus" );        
        
    Torus.drawTorus = function( nsides, rot, doSpikes, numLines )
    {
        this.savensides = nsides;
        this.saverot = rot;
        this.savedoSpikes = doSpikes;
        this.saveNumLines = numLines;

        var size = new Point( this.canvas.width / 2, this.canvas.height / 2 );
        var circleang, circleinc, ellipseang, ellipseinc, circlerad, offset;
        var center = new Point(0,0);
        var old = new Point(0,0);

        circlerad = ((size.x + size.y) / 2) / 2;
        var axis = new Point( size.x - circlerad, size.y - circlerad );

        circleinc = nsides;
        circleinc = Math.PI / (circleinc / 2);

        offset = (180.0 / nsides);
        offset = offset * (Math.PI / 180.0);

        ellipseinc = Math.PI / Math.floor( numLines );  // Step size
        if (rot != 0.0)
            rot = ellipseinc / (1.0 / rot);

        ellipseang = 0.0;

        this.dc.strokeStyle = "green";
        this.dc.beginPath();
        
        do {
            center.polar( axis, ellipseang, size );
            
            if (doSpikes)
                old.polar( axis, ellipseang - ellipseinc, size );
            else
                this.pmoveTo( circlerad, offset, center );

            circleang = 0.0;
            do {
                if (doSpikes)
                    this.pmoveTo( 1, offset, center );

                this.plineTo( circlerad, circleang + offset, center );

                if (doSpikes)
                    this.plineTo( circlerad, circleang+offset-rot, old );
                
                circleang = circleang + circleinc;
            } while (!(circleang > 2.0 * Math.PI + circleinc));
            offset = offset + rot;
            ellipseang = ellipseang + ellipseinc;
        } while (!(ellipseang >= 2.0 * Math.PI));
        this.clear();
        this.dc.stroke();
    }
            
    Torus.random = function()
    {
        // Note "X | 0" is an idiom for int(x)
        var nsides = (Math.random() * 6 + 3) | 0;
        var rotateAmount = ((Math.random() * 5) + 1) | 0;
        var doSpikes = (Math.random()*2)&1 == 1 ? true : false

        // Update controls with the new values
        this.drawTorus( nsides, rotateAmount, doSpikes, 60 );
        $("#nsides").val( nsides );
        $("#nrot").val( rotateAmount  );
        $("#spikes").prop( "checked", doSpikes );
        $("#spikes").button('refresh');  // JQueryUI bug, must force refresh
    }
        
    Torus.redraw = function()
    {
        // Re-draw with previously set values
        if (typeof( this.savensides ) != "undefined")
        {
            this.drawTorus( //Number($("#nsides").spinner( "value" )), // JQueryUI
                            Number($("#nsides").val()),                // JQuery
                            Number($("#nrot").val()),
                            $("#spikes").prop('checked'),
                            this.saveNumLines );
        } else
            // No previously set values, so choose some
            this.random();
    }
        
    // Control handlers
    
    $("#torus_rand").button().click(function() {
        Torus.random();
    });

    $("#nsides,#nrot").spinner( {
        change: function( event, ui ) { Torus.redraw(); },
        stop: function( event, ui ) { Torus.redraw(); }
    });

    $("#spikes").button().click(function() {
        Torus.redraw();
    });
        
    ///////////////////////////////
    // Magic-specific Definitions
    ///////////////////////////////

    var Magic = new StringArt( "magic" );
    var kMagicSliderSteps = 360;  // Should be "const", but that chokes IE9
    
    // Pass in a value from 0..1
    Magic.drawMagic = function( angle )
    {
        this.saveAngle = angle;
        angle = angle * Math.PI + Math.PI / 2.0;
        var size = Math.min( this.canvas.width, this.canvas.height );
        var center = new Point( this.canvas.width/2, this.canvas.height/2 );
        var length = 5;
        var step = angle;
        
        this.dc.strokeStyle = "green";
        this.dc.beginPath();
        this.dc.moveTo( center.x, center.y );
        
        while (length < (size/2 - 10))
        {
            this.plineTo( length, step, center );
            length += angle / ( Math.PI / 2.0 );
            step += angle;
        }
        this.clear();
        this.dc.stroke();
    }
        
    Magic.random = function()
    {
        var r = Math.random();
        // Update angle control
        $("#magic_slider").slider( "value", (r*kMagicSliderSteps)|0 );
        Magic.drawMagic( r );
    }
        
    Magic.redraw = function()
    {
        // If previously drawn, redraw, otherwise choose random value
        if (typeof( this.saveAngle ) == "number")
            this.drawMagic( this.saveAngle );
        else
            this.random();
    }
        
    // Control Handlers

    $("#magic_slider").slider( {
        max:kMagicSliderSteps,
        min: 1,
        slide: function( event, ui ) {
            Magic.drawMagic( ui.value / kMagicSliderSteps );
        }
    });
    
    $("#magic_rand").button().click(function() {
        Magic.random();
    });

    //////////////////////////
    // Generic functionality
    //////////////////////////
    
    // Reconfigure the size of the canvas & containing div
    // when initialized or when the browser window changes size.

    // I found via trial and error that vertical space must be forced
    // into place; HTML won't do this for you.
    function resetHeight( idname )
    {
        function getID(suffix)   // Create the #objname_blah ID tag
        {
            return "#" + idname + "_" + suffix;
        }
        
        var docHeight = $(window).height();
        var tabHeight = $(".ui-widget-header").height();
        var mysteryGap = 90;
        var topHeight = $("#top_bar").height();
        // Since the content is initially empty, we need to force it to
        // occupy the screen height
        $(getID("content")).height(docHeight - (tabHeight + topHeight + mysteryGap));
        // Force the canvas to fill the content
        // (it defaults to 300x150...useless!)
        var jqCanvas = $(getID("canvas")).get(0);
        jqCanvas.height = $(getID("content")).height() - 1;
        jqCanvas.width =  $(getID("content")).width() - 1;
    }   

    // "index" is the tab index, 0 = magic, 1 = torus
    function redrawTabContent( index )
    {
        var redrawObjects = [Magic, Torus];

        resetHeight( redrawObjects[index].name );
        redrawObjects[index].redraw();
    }        
    
    $( "#tabs" ).tabs({
        show:function(event, ui)
        {
            redrawTabContent( ui.index );
        }
    });

    $(window).resize( function() {
        redrawTabContent( $("#tabs").tabs( 'option', 'selected' ) );
    });

    // Ugh - in Webkit, the buttons are a couple pixels off.  This hack at
    // least fixes the one on the left.  You're not supposed to do this.
    if ($.browser.webkit)
        $(".gtab-controls").css("left", "0px");

/*
    // Code to manually implement "spinner" objects.
    // These will be available in JQueryUI 1.9
    $(".upcount,.downcount").click( function( eventObj ) {
        // Find the ID of the related input field in the table
        var inputObj = $(this).parent().parent().parent().find("input");
        var vID = inputObj.attr('id');
        
        var maxVal = inputObj.attr('max');
        var minVal = inputObj.attr('min');
        var number = Number($("#" + vID).val());

        // Look at this object's class to see if it's upcount or downcount
        if ($(this).attr("class") == "downcount")
            { if (number > minVal) number--; }
        else
            { if (number < maxVal) number++; }

        $("#" + vID).val( number );
        redrawTabContent( $("#tabs").tabs( 'option', 'selected' ) );
    });
*/
});
