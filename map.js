var width = 1000;
var height = 500;
var selectedState = "";

document.addEventListener("DOMContentLoaded", function(event) { /* begin "DOMContentLoaded" event */

    var mapdata;

    const pathref = d3.geoPath();
    const projection = d3.geoMercator();
    const pathgen = d3.geoPath().projection(projection);

    // add on-click
    d3.select("#map").on("click", (e) => {
        let isOcean = e.path[0].tagName == 'svg';
        if (isOcean) {
            zoomNational();
            removeBar();
            drawBar("National");
        }
     });

    function ddClick(e)
    {
        state = e.target.attributes.data.value;
        console.log(state + " dropdown clicked!");
        selectedState = state;
        if (state == "National") {
            zoomNational();
            removeBar();
            drawBar("National");
        } else {
            zoomToState(selectedState);
            removeBar();
            drawBar(selectedState);
        }
        return false;
    }


    var drawMap = function(){
        var svg = d3.select("#map")
            .append("svg")
            .attr("height", height)
            .attr("width", width)
            .append("g");

        d3.json("resources/data/gz_2010_us_040_00_500k.json").then((data) =>{
            mapdata = data;
            var stateNames = []
            for(var i = 0; i < data.features.length; i++){
                if(data.features[i].properties["NAME"] != "Alaska" && data.features[i].properties["NAME"] != "Hawaii" )//Remove to Contiguous 48
                stateNames.push(data.features[i].properties["NAME"]);
            }
            stateNames = stateNames.sort();
            stateSelectDD = document.getElementById("stateSelector");
            for(var i = 0; i < stateNames.length; i++)
            {
                var ddid = "dropdown_" + stateNames[i].replace(/\s/g, '');
                stateSelectDD.innerHTML += "<li><a id='" + ddid + "' class='dropdown-item' href='#' data='" + stateNames[i].replace(/\s/g, '') + "'>" + stateNames[i] + "</a></li>";
                var delem = document.getElementById(ddid);
            }
            var dds = document.getElementsByClassName('dropdown-item');
            for(i = 0; i < dds.length; i++)
            {
                dds[i].addEventListener('click', (e) => ddClick(e));
            }
            const paths = svg.selectAll("path").data(data.features);
            paths.enter()
                .append("path")
                .attr("id", n=>"state_" + n.properties.NAME.replace(/\s/g, ''))
                .attr("class", n=>n.properties.NAME.replace(/\s/g, '') + " state")
                .attr("d",d => pathgen(d))

                // state border coloring
                .attr("fill", "black")
                .attr("stroke-width", "0.0625")
                .attr("stroke", "black")
                .on("mousemove", function(e, d) {
                    d3.select(this).style("fill", "yellow")
                        .attr('fill-opacity', 0.3);
                        tooltip_wake(e, d);
                  })
                .on("mouseleave", function(d) {
                    d3.select(this).style("fill", "grey")
                        .attr('fill-opacity', 1);
                        tooltip_sleep();
                })
                .on("click", function(event, d) {
                    g = d3.select('svg g');
                    var thisState = d.properties.NAME;

                    var zoomOut = selectedState == thisState;
                    
                    selectedState = thisState;
                    
                    const bounds = this.getBBox();
                    const x0 = bounds.x;
                    const x1 = bounds.x + bounds.width;
                    const y0 = bounds.y;
                    const y1 = bounds.y + bounds.height;

                    if(!zoomOut)
                    {
                        var t = "translate(" + (width / 2) + "," + (height / 2) + ") scale(" + (1 / Math.max((x1 - x0) / width, (y1 - y0) / height)) + ") translate(" + (-(x0 + x1) / 2) + "," + (-(y0 + y1) / 2) + ")";
                    }
                    else
                    {
                        var t = "translate(-600,-450) scale(5)";
                        selectedState = "";
                    }

                    g.transition().duration(1000).attr("transform", t);

                    removeBar();
                    drawBar(thisState);
                })
            zoomNational();
            removeBar();
            drawBar("National");
        });
/*
        d3.csv('resources/data/usretechnicalpotential_national.csv').then(data => {
            energydata = data
            console.log(data)
            const paths = svg.selectAll("path").data(data);
            paths.enter()

                .on("click", function(d) {
                    
                })
                
                
        })*/
    };

    



    
    // function zoomFit(paddingPercent, transitionDuration) 
    // {
    //     svg = d3.select("svg");
    //     g = d3.select("svg g");
    //     bb = g.node().getBBox();
    //     widthv = bb.width;
    //     heightv = bb.height;
    //     console.log(g.node().getBBox());
    //     if (widthv && heightv){
    //         //TODO: This is janky. Need a more robust method. -AMH (It's also my fault)
    //         scale = 4;
    //         zoomf.scaleTo(svg, scale);
    //         zoomf.translateTo(svg, widthv * 1.45, heightv * 1.65);
    //     }
    // }

    // let zoomf = d3.zoom().on('zoom', handleZoom);

    function tooltip_wake(e, d)
    {
        tt = document.getElementById("tooltip");
        nametext = document.getElementById("tooltip_name");
        nametext.innerHTML = d.properties["NAME"];
        tt.style.left = e.pageX + "px";
        tt.style.top = e.pageY + "px";
        tt.style.display = "block";
    }

    function tooltip_sleep()
    {
        tt = document.getElementById("tooltip");
        tt.style.display = "none";
    }
    
    //Zoom Setup
    let zoomf = d3.zoom().on('zoom', handleZoom);
    
    function zoomTo(x,y,k){
        var ctx = d3.zoomIdentity.translate(x, y).scale(k);
        d3.select('svg g').call(zoomf.transform, ctx);
    }
    
    function handleZoom(e) {
            d3.select('svg g')
            .attr('transform', e.transform);
            console.log(e.transform);
    }

    function zoomToState(s){
        st = d3.select("#state_" + s);
        const bounds = st.node().getBBox();
        const x0 = bounds.x;
        const x1 = bounds.x + bounds.width;
        const y0 = bounds.y;
        const y1 = bounds.y + bounds.height;
    
        var t = "translate(" + (width / 2) + "," + (height / 2) + ") scale(" + (1 / Math.max((x1 - x0) / width, (y1 - y0) / height)) + ") translate(" + (-(x0 + x1) / 2) + "," + (-(y0 + y1) / 2) + ")";
        var g = d3.select("svg g");
        g.transition().duration(1000).attr("transform", t);
    }

    function zoomNational(){
        zoomTo(-600, -450, 5);
        selectedState = "";
    }

    var removeBar = function(){
        var svg = d3.select("#chart")
        svg.selectAll('*').remove();
    }

    var drawBar = async function(region){
        var margin = {top: 20, right: 20, bottom: 85, left: 75},
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    
        // add chart to the barchart div
        var svg = d3.select("#chart")
                    .append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom + 5)
                    .append("g")
                        .attr("transform",
                            "translate(" + margin.left + "," + margin.top + ")");
        
        // get the data
        let data = []
        await d3.csv('resources/data/usretechnicalpotential_column_aggs.csv', d3.autoType)
        .then(d => {
            data = d
            //console.log(data);
            
            var needed = data.columns.slice(-7);
            var data_filt = data.filter(function(dd){return dd.Region==region});
            console.log(data_filt)
            // get multiple key values
            const subset = (({ all_PV, all_Wind, all_CSP, all_biopower, all_Hydrothermal, all_Geothermal, all_hydropower}) => 
                ({  all_PV, all_Wind, all_CSP, all_biopower, all_Hydrothermal, all_Geothermal, all_hydropower}))(data_filt[0]);
            // transforms object into array
            const data_array = Object.entries(subset).map(([key, value]) => ({
                    key: key,
                    value: value
            }));            
    
            // X axis
            var x = d3.scaleBand()
                .range([ 0, width ])
                .domain(data_array.map(function(d) { return d.key; }))
                //.domain(data.map(function(d) { return d.Region; }))
                //.domain(data_filt.map(function(d) { return d[0]; }))
                //.domain(needed) // gets only the columns starting with 'all'
                .padding(0.2);
            svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");
    
            // text label for the x axis
            svg.append("text")      
            .attr("x", width / 2 )
            .attr("y",  height + margin.bottom)
            .style("text-anchor", "middle")
            .text("Energy Type");
    
            // Add Y axis
            var y = d3.scaleLinear()
            .domain([0, d3.max(Object.values(subset))])
            //.domain([0, 160000])
            .range([ height, 0]);
            svg.append("g")
            .call(d3.axisLeft(y));
    
            // text label for y axis
            svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Potential Generation Capacity (GW)");
    
            // Bars
            svg.selectAll("mybar")
            .data(data_array)
            .enter()
            .append("rect")
                .attr("x", function(d) { return x(d.key); } )
                .attr("y", function(d) { return y(0); } )
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(0); })
                .attr("fill", "yellow")
            ;

            // Animation
            svg.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .delay(function(d,i){return(i*100)})
    
        })
    
    }

    drawMap();
    drawBar("National");
  } /* cease "DOMContentLoaded" event */
);   

var saver;
