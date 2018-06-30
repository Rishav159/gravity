function getAngle(x1,y1,x2,y2){
    return Math.atan2((y2-y1),(x2 - x1));
}

function getDistance(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(y2-y1,2) + Math.pow(x2-x1,2))
}

var height = 600;
var width = 900;
var padding = 20;
var speedFactor = 0.2;
class BlackHole{
    constructor(mass){
        this.x = width / 2;
        this.y = height /2;
        this.size = 20;
        this.mass = mass;
    }
    addToSVG(svg) {
        this.hole = svg.append('circle')
            .attr('cx',this.x)
            .attr('cy',this.y)
            .attr('r',this.size);
    }
}

class Rocket{
    constructor(blackhole,initialVelocity,rocketMass,G){
        this.blackhole = blackhole;
        this.height = 25;
        this.width = 25;
        let angle = Math.random()*2*Math.PI - Math.PI/2;
        this.position = [Math.random()*(width-2*padding) , Math.random()*(height-2*padding)];
        this.velocity = [initialVelocity*Math.cos(angle) , initialVelocity*Math.sin(angle)];
        this.acceleration = [0,0];
        this.mass = rocketMass;
        this.G = G;
    }

    addToSVG(svg){
        this.svg = svg;
        let angle = getAngle(this.position[0],this.position[1],this.position[0] + this.velocity[0], this.position[1] + this.velocity[1]);
        let xoffset = (this.width/2)*Math.cos(angle) - (this.height/2)*Math.sin(angle);
        let yoffset = (this.width/2)*Math.sin(angle) + (this.height/2)*Math.cos(angle);
        this.rocket = svg.append('svg:image')
            .attr('link:href','rocket.svg')
            .attr('x',this.position[0] - xoffset)
            .attr('y',this.position[1] - yoffset)
            .attr('height',this.height)
            .attr('width',this.width)
            .style('fill','blue');
    }

    applyGravity() {
        let distance = getDistance(this.position[0],this.position[1],this.blackhole.x,this.blackhole.y)
        let force = this.G*this.mass*this.blackhole.mass/(distance*distance);
        let angle = getAngle(this.position[0],this.position[1],this.blackhole.x,this.blackhole.y);
        this.acceleration[0] = force*Math.cos(angle);
        this.acceleration[1] = force*Math.sin(angle);
    }

    checkOffscreen() {
        if(this.position[0] < -1000 || this.position[0] > width+1000 || this.position[1] < -1000 || this.position[1] > height+1000){
            return true;
        }else{
            return false;
        }
    }

    checkDeath() {
        let distance = getDistance(this.position[0],this.position[1],this.blackhole.x,this.blackhole.y)
        if( distance<= this.blackhole.size){
            return true;
        }
        return false;
    }

    destroy() {
        this.rocket.remove();
    }

    move(){
        this.applyGravity();
        this.velocity[0] += this.acceleration[0];
        this.velocity[1] += this.acceleration[1];
        this.position[1] += this.velocity[1]*speedFactor;
        this.position[0] += this.velocity[0]*speedFactor;
        let angle = getAngle(this.position[0],this.position[1],this.position[0] + this.velocity[0],this.position[1] + this.velocity[1]);
        let xoffset = (this.width/2)*Math.cos(angle) - (this.height/2)*Math.sin(angle);
        let yoffset = (this.width/2)*Math.sin(angle) + (this.height/2)*Math.cos(angle);
        this.rocket.transition().duration(1)
            .attr('x',this.position[0] - xoffset)
            .attr('y',this.position[1] - yoffset)
            .attr('transform','rotate('+(angle*180/Math.PI + 90)+','+this.position[0]+','+this.position[1]+')')
            .on('end',()=>{
                if(!this.checkOffscreen() && !this.checkDeath()){
                    this.move();
                }else{
                    this.destroy();
                }
            });
    }
}

class SpaceDiagram {
    constructor(){
        this.start();
    }
    start(){
        var blackholeMass = parseInt($('#blackHoleMass').val());
        var rocketMass = 10;
        var G = parseInt($('#G').val());
        var initialVelocity = parseInt($('#initialVelocity').val());
        var rocketCount = parseInt($('#totalRockets').val());;
        let container = d3.select('#container');
        container.html('');
        let svg = container.append('svg')
                    .attr('height',height).attr('width',width)
                    .style('background-image','url("back.png")')
                    .style('background-repeat','round');
    
    
        let bh = new BlackHole(blackholeMass);
        bh.addToSVG(svg);
    
        let rockets = [];
        for(let i = 0; i < rocketCount; i++){
            rockets.push(new Rocket(bh,initialVelocity,rocketMass,G));
            rockets[i].addToSVG(svg);
            rockets[i].move();
        }
    }
}

$(document).ready(function(){
    var diagram = new SpaceDiagram();
    ['blackHoleMass','G','initialVelocity','totalRockets'].map(function(val){
        $('#'+val).on('change',function(){
            diagram.start();
        })
    })
    
})