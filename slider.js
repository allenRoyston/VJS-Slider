import anime from "animejs";

export class VJSlider {
    constructor(ele, anime) {       
        this.ele = ele;     
        
        this.previousImage = 0   
        this.currentImage = 0        
        this.randomId = null
        this.options = {
            padding: (!!this.ele.getAttribute('padding')) ? parseInt(this.ele.getAttribute('padding')) : 0,
            cardbg: (!!this.ele.getAttribute('cardbg')) ? this.ele.getAttribute('cardbg') : 'black',
            speed: (!!this.ele.getAttribute('speed')) ? parseInt(this.ele.getAttribute('speed')) : 400,
            height: (!!this.ele.getAttribute('height')) ? parseInt(this.ele.getAttribute('height')) : 400,            
            type:  (!!this.ele.getAttribute('type')) ? this.ele.getAttribute('type') : 'slide',
            easing: (!!this.ele.getAttribute('easing')) ? this.ele.getAttribute('easing') : 'easeInOutQuart',
            size: (!!this.ele.getAttribute('size')) ? this.ele.getAttribute('size') : 'default',
            touch: (!!this.ele.getAttribute('touch')) ? this.ele.getAttribute('touch')  === 'touch' || this.ele.getAttribute('touch')  === 'true' : false,
            lazyload: (!!this.ele.getAttribute('lazyload')) ? this.ele.getAttribute('lazyload')  === 'lazyload' || this.ele.getAttribute('lazyload')  === 'true' : true,
            preload: (!!this.ele.getAttribute('preload')) ? this.ele.getAttribute('preload')  === 'preload' || this.ele.getAttribute('preload')  === 'true' : false,
            text: (!!this.ele.getAttribute('text')) ? this.ele.getAttribute('text') === 'true' || this.ele.getAttribute('text')  === 'true' : true, 
            controls: (!!this.ele.getAttribute('controls')) ? this.ele.getAttribute('controls')  === 'controls' || this.ele.getAttribute('controls')  === 'true' : false,
            dots: (!!this.ele.getAttribute('dots')) ? this.ele.getAttribute('dots') === 'dots' || this.ele.getAttribute('dots')  === 'true' : false,
            arrowdots: (!!this.ele.getAttribute('arrowdots')) ? this.ele.getAttribute('arrowdots') === 'arrowdots' || this.ele.getAttribute('arrowdots')  === 'true': null, 
            autoplay:{
              active: (!!this.ele.getAttribute('autoplay')) ? this.ele.getAttribute('autoplay')  === 'autoplay' || this.ele.getAttribute('autoplay')  === 'true': false,
              delay: (!!this.ele.getAttribute('delay')) ? parseInt(this.ele.getAttribute('delay')) : 2000,
              interval: (!!this.ele.getAttribute('interval')) ? parseInt(this.ele.getAttribute('interval')) : 3000,
              event: null
            },   
            preloadCount: 0,
            lazyloadCount: 0,
            lazyloadThreshold: (!!this.ele.getAttribute('threshold')) ? parseInt(this.ele.getAttribute('threshold')) : 700,
            lazyloadEvent: null, 
            mockdelay:  (!!this.ele.getAttribute('mockdelay')) ? parseInt(this.ele.getAttribute('mockdelay')) : 0,
        }     
        

        this.animejsInstalled = !!anime ? false : true
        this.options.type = !this.animejsInstalled ? 'slide' : this.options.type 

        this.HTMLSnippets = {
          dots: '&squf;',
          leftarrowdot: '&ltrif;',
          rightarrowdot: '&rtrif;',
          leftbtn: '<',
          rightbtn: '>',
          lazyloader: '<span style="color: white">Please wait</span>'
        }        

        this.cards = {
            ele: null,
            to: null, // top overlay
            bo: null,  // bottom overlay
            h: [],  // horizontal
            v: []  // vertical
        }
        this.buttons = {
            next: null,
            prev: null, 
            locked: false
        }
        this.texts = {
          header: null,
          footer: null, 
          ele: []
        }

        // grab from data blocks 
        this.images = [];
        this.ele.querySelectorAll('data').forEach(ele => {          
          let type = !!ele.getAttribute('type')  ? ele.getAttribute('type') : 'image'
          switch(type.toLowerCase()){
            case 'image':          
              const _image = ele.getAttribute('image');
              const _header = (!!ele.getAttribute('header')) ? ele.getAttribute('header') : '';
              const _footer = (!!ele.getAttribute('footer')) ? ele.getAttribute('footer') : '';
              const _easing = (!!ele.getAttribute('easing')) ? ele.getAttribute('easing') : 'easeInOutQuart';

              if(!!_image){
                this.images.push({src: _image, header: _header, footer: _footer, easing: _easing})
              }
            break
            case 'dots':
              this.HTMLSnippets.dots = !!ele.getAttribute('html') ? ele.getAttribute('html') : ''              
            break
            case 'leftarrowdot':
              this.HTMLSnippets.leftarrowdot = !!ele.getAttribute('html') ? ele.getAttribute('html') : ''              
            break  
            case 'rightarrowdot':
              this.HTMLSnippets.rightarrowdot = !!ele.getAttribute('html') ? ele.getAttribute('html') : ''              
            break      
            case 'rightbtn':
              this.HTMLSnippets.rightbtn = !!ele.getAttribute('html') ? ele.getAttribute('html') : ''              
            break  
            case 'leftbtn':
              this.HTMLSnippets.leftbtn = !!ele.getAttribute('html') ? ele.getAttribute('html') : ''              
            break   
            case 'lazyloader':
              this.HTMLSnippets.lazyloader = !!ele.getAttribute('html') ? ele.getAttribute('html') : ''              
            break                                                
          }
          // remove original image from dom
          this.ele.removeChild(ele);
        })  

        // if no image, causes error, so fill with defaults
        if(this.images.length === 0){
          this.images = [{src: ''}]
        }

        this.inputElements = []
        this.init()
    }

    build(parameters, resetIndex = true){      
        let {randomId, options}   = this;

        if(!!parameters.images){
            this.images = []
            parameters.images.forEach(image => {
                this.images.push({src: image.src, header: '', footer: '', easing: ''})
            })
        }     

        if(!!parameters.options){
            options.padding = !!parameters.options.padding ? parameters.options.padding : options.padding; 
            options.cardbg = !!parameters.options.cardbg ? parameters.options.cardbg : options.cardbg; 
            options.speed = !!parameters.options.speed ? parameters.options.speed : options.speed; 
            options.height = !!parameters.options.height ? parameters.options.height : options.paddheighting; 
            options.type = !!parameters.options.type ? parameters.options.type : options.type; 
            options.easing = !!parameters.options.easing ? parameters.options.easing : options.easing; 
            options.size = !!parameters.options.size ? parameters.options.size : options.size; 
            options.touch = !!parameters.options.touch ? parameters.options.touch : options.touch; 
            options.lazyload = !!parameters.options.lazyload ? parameters.options.lazyload : options.lazyload; 
            options.text = !!parameters.options.text ? parameters.options.text : options.text; 
            options.controls = !!parameters.options.controls ? parameters.options.controls : options.controls; 
            options.dots = !!parameters.options.dots ? parameters.options.dots : options.dots; 
            options.lazyloadThreshold = !!parameters.options.lazyloadThreshold ? parameters.options.lazyloadThreshold : options.lazyloadThreshold; 
            
            // autoplay settings
            if(!!parameters.options.autoplay){                
                options.autoplay.active = !!parameters.options.autoplay.active ? parameters.options.autoplay.active : options.autoplay.active; 
                options.autoplay.delay = !!parameters.options.autoplay.delay ? parameters.options.autoplay.delay : options.autoplay.delay; 
                options.autoplay.interval = !!parameters.options.autoplay.interval ? parameters.options.autoplay.interval : options.autoplay.interval; 
            }
        }

        // reset counters/preloaders
        this.currentImage = resetIndex ? 0 : this.currentImage
        options.preloadCount = 0;
     
        // clear all intervals
        document.querySelectorAll(`#${randomId} .__si`).forEach(ele => {
            clearInterval(ele.timerEvent)            
        })      

        this.ele = document.querySelector(`#${randomId}`)
        this.ele.innerHTML = '';
        
        this.init()
        
    }

    returnElement(){
        let {randomId} = this
        return document.querySelector(`#${randomId}`)
    }

    currentProperties(){
        return this.options 
    }

    slideData(){        
        return {index: this.currentImage, current:this.images[this.currentImage], images: this.images}
    }

    update(parameters){
        this.build(parameters, false)
        return this.options
    }

    destroy(callback = () => {}){
        let {randomId} = this
        this.ele = document.querySelector(`#${randomId}`)
        this.ele.parentNode.remove()  
        callback()
    }


    getNext(amount = 1, sp = this.currentImage){
        let {images, currentImage} = this    
        return (sp + amount < images.length) ? (sp + amount) : this.getNext(amount - images.length)
    }

    getPrev(amount = 1, sp = this.currentImage){
        let {images, currentImage} = this
        return (currentImage - amount >= 0) ? (currentImage - amount) : this.getPrev(amount - images.length)
    }

    init(){             
        this.buildLayout()
        this.setActiveCard()
        this.markActiveDot()  
        this.loadText()    
        this.lock(false)
    }


    buildLayout(){
        let {randomId, ele, buttons, inputElements, cards, images, options} = this;
        this.randomId = randomId === null ? `__slider_${Math.random().toString(36).substring(7)}` : randomId

        // build horzintal layout
        let horizontalSlide = '';
        for(var i = 0; i < 3; i++){
            horizontalSlide += `<div class='__hs' style='width: calc(33.333334% - ${options.padding*2}px); height: calc(100% - ${options.padding*2}px); float: left; padding: ${options.padding}px; background-color: ${options.cardbg}'></div>`
        }

        
        // build vertical layout
        let verticalSlide = '';
        for(var i = 0; i < 3; i++){
            verticalSlide += `<div class='__vs'  style='width: calc(100% - ${options.padding*2}px); height: calc(33.33334% - ${options.padding*2}px); float: block; padding: ${options.padding}px; background-color: white'></div>`     
        }   


        // build dots
        let dots = '';
        let _dotHTML = this.ele.querySelector('dots')        
        if(options.arrowdots){
          dots +=  `<button class='vj-slider--dots-item __arrowdots'>${this.HTMLSnippets.leftarrowdot}</button>`
        }
        for(let i = 0; i < images.length; i++){                    
          dots +=  `<button class='vj-slider--dots-item __dot'>${this.HTMLSnippets.dots}</button>`          
        }
        if(options.arrowdots){
          dots +=  `<button class='vj-slider--dots-item __arrowdots'>${this.HTMLSnippets.rightarrowdot}</button>`
        }        

        // build text
        let texts = '<div style="display: none"><p class="__texts"></p><p class="__texts"></p></div>';  // renders but doesn't show
        if(options.text){ 
          texts = `          
          <div class='vj-slider--text-header-banner'>
            <p class='vj-slider--text-header __texts'></p>
          </div>
          <div class='vj-slider--text-footer-banner'>
            <p class='vj-slider--text-footer __texts'></p>
          </div>    
          `    
        }

        // preloaded images
        let preloadImages = '';
        if(options.preload){
          this.images.forEach((image, index) => {
            preloadImages += `<img id='pl_${index}' class='__si' src='${image.src}' style='position: absolute; z-index: -1; pointer-events: none' onload='${setTimeout(() => {this.preloadComplete(index)}, 1)}'/>`
          })
        }
        let _layout = document.createElement('div');

        let _layouttype = '';        
        if(this.determineType() === 'v'){
            _layouttype = `
                <div style='position: absolute; top: 0; left: 0; width: 100%; height: 300%; transform: translateY(-33.33334%); display: block'>                
                    ${verticalSlide}        
                </div>
            `
        }
        if(this.determineType() === 'h'){
            _layouttype = `
                <div style='position: absolute; top: 0; left: 0; width: 300%; height: 100%; transform: translateX(-33.33334%)' z-index: -1'>                
                    ${horizontalSlide}                                
                </div>
            `
        }

        // TRANSITION SLIDES
        if(!options.touch){
          _layout.innerHTML =`
          <!-- container -->
          <div id='${this.randomId}' class='vj-slider--container' style='opacity: ${options.preload ? 0 : 1}'>
            <div class='vj-slider vj-slider--${options.size === "default" ? 'default' : options.size === "small" ? 'small' : 'large'}''  style='width: calc(100% - ${options.padding*2}px); padding: ${options.padding}px; position: relative; overflow: hidden;'>
                              
                <div class='__underlay'></div>
                ${_layouttype}
                <div class='__overlay' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%'></div>

                <div class='__loading' style='position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none'>
                  ${this.HTMLSnippets.lazyloader}                
                </div>              
      
                <div class='vj-slider--button-left __button '>
                    <button class='icon'>
                        ${this.HTMLSnippets.leftbtn}
                    </button>
                </div>
                <div class='vj-slider--button-right __button'>
                    <button class='icon'>
                        ${this.HTMLSnippets.rightbtn}
                    </button>
                </div>     

                ${texts}
  
                <div id='__ll_master' style='position: absolute; z-index: -1; pointer-events: none'></div>

                ${preloadImages}
            </div>
            
            <div class='vj-slider--dots-container'>
                ${dots}
            </div>      
          </div>      
          `
        }

        // touch MODE
        else{
          let touchSlides = '';
          for(var i = 0; i < images.length; i++){
            touchSlides += `
              <div style='width: calc(${100/images.length}% - ${options.padding*2}px); height: calc(100% - ${options.padding*2}px); float: left;padding: ${options.padding}px;'>
                  <div style='width: 100%;height: 100%; display: flex; align-items: center; justify-content: center;color:'>
                    <div style='background: url(${images[i].src}) no-repeat center center; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover; width: 100%; height: 100%'></div>
                  </div>
              </div>
              `
          }

          _layout.innerHTML =`
          <!-- container -->
          <div id='${this.randomId}' class='vj-slider--container' style='opacity: ${options.preload ? 0 : 1}'>
            <div class='vj-slider vj-slider--${options.size === "default" ? 'default' : options.size === "small" ? 'small' : 'large'}'' style='width: 100%; padding: ${options.padding}px; position: relative; overflow-x: scroll; -webkit-overflow-scrolling: touch;'>
              <div style='position: absolute; top: 0; left: 0; width: ${images.length*100}%; height: 100%; display: block;'> 
                ${touchSlides}
              </div>


              <!-- TEXTS -->
              ${texts}              
            </div>
          </div>
          `
        }

        // remove old elements
        ele.parentNode.insertBefore( _layout, ele );
        ele.parentNode.removeChild(ele);

        // get elements
        cards.ele =  document.querySelector(`#${this.randomId}`);
        cards.h = []; cards.v = [];
        document.querySelectorAll(`#${this.randomId} .__hs`).forEach(ele => {
            cards.h.push(ele)
        })
        document.querySelectorAll(`#${this.randomId} .__vs`).forEach(ele => {
            cards.v.push(ele)
        })        

        document.querySelectorAll(`#${this.randomId} .__texts`).forEach((ele, index) => {   
          ele.updateText = (str) => {            
            ele.innerHTML = (str === null || str === undefined || str === '') ? '&nbsp;' : str

            if(this.animejsInstalled){
                anime({
                targets: ele.parentElement,
                duration: 300,
                easing: 'easeInSine',
                opacity: (str === null || str === undefined || str === '') ? 0 : 1             
                });   
            }
            else{
                ele.parentElement.style.opacity = (str === null || str === undefined || str === '') ? 0 : 1       
            }

          }       
          this.texts[index === 0 ? 'header' : 'footer'] = ele
          this.texts.ele.push(ele)
        })    
        

        // get button and attach actions
        document.querySelectorAll(`#${this.randomId} .__button, #${this.randomId} .__arrowdots`).forEach((ele, index) => {
            inputElements.push(ele)
            ele.addEventListener('click', () => {
              clearInterval(this.options.autoplay.event)              
              if(!buttons.locked){
                  this.lock(true)                  
                  index === 1 || index === 3 ? this.next() : this.prev()
              }
            })
        })  
        
        // get button and attach actions
        document.querySelectorAll(`#${this.randomId} .__dot`).forEach((ele, index) => {
            inputElements.push(ele)
            ele.addEventListener('click', () => {                
              clearInterval(this.options.autoplay.event)
              if(!buttons.locked){     
                  if(index > this.currentImage){      
                    this.lock(true)
                    this.previousImage = this.currentImage
                    this.currentImage = index       
                    this.setImageLoading(true)
                    this.setImageOnCard(0, index, () => {            
                       this.animate(false, () => {})            
                    })                                      
                  }
                  if(index < this.currentImage){   
                    this.lock(true)
                    this.previousImage = this.currentImage
                    this.currentImage = index;                          
                    this.setImageOnCard(2, index, () => {         
                        this.animate(true, () => {})          
                    })
                  }
              }
            })
        })     
    
        // setup autoplay
        if(options.autoplay.active){
          setTimeout(() => {
            this.lock(true);this.next()            
            this.options.autoplay.event = setInterval(() => {
              if(!buttons.locked){
                this.lock(true);this.next()
              }
            }, this.options.autoplay.interval)
          }, this.options.autoplay.delay)
        }           
    }   


    
    setActiveCard(callback = () => {}){
        let {cards, currentImage} = this;
        
        cards[this.determineType()].forEach((card, index) => {   
            if(index === 1){      
                this.setImageOnCard(index, currentImage, callback)             
            }                      
        })          
    }

    setImageOnCard(cardIndex = 0, imageIndex = 0, callback = () => {}){
        let {cards, images, options} = this;
        setTimeout(() => {
            cards[this.determineType()][cardIndex].innerHTML = `
                <div id='ll_${cardIndex}${imageIndex}' style='width: calc(100%); height: calc(100%); overflow: hidden'>
                    <div style='background: url(${images[imageIndex].src}) no-repeat center center; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover; width: 100%; height: 100%'></div>
                </div>
            `  

        
            this.preloadImage(images[imageIndex].src, () => {          
                callback()
            })
        }, options.mockdelay)
       
    }

    determineType(){
        let {options} = this
        return options.type === 'cascade' || options.type === 'waterfall' ? 'v' : 'h'
    }

    preloadComplete(index){
      let {randomId} = this;
      let ele = document.querySelector(`#${randomId} #pl_${index}`)     
      if(!!ele){
        ele.timerEvent = setInterval(() => {    
            if(ele.height > 0){        
                clearInterval(ele.timerEvent)
                this.preloadCompleteCheck()
            }                
        }, 10)       
      }
      else{
        clearInterval(ele.timerEvent)
      }
    }

    preloadCompleteCheck(){
      let {randomId, images, options} = this;   
      options.preloadCount++
      if(options.preloadCount === images.length){
        setTimeout(() => {
          let ele = document.querySelector(`#${randomId}`)
          ele.style.opacity = 1
        })
      }        
    }



    preloadImage(image, callback = () => {}, force = false){           
        let {randomId, options} = this;

        if(options.lazyload){
             options.lazyloadCount ++
        
            let ele = document.querySelector(`#${randomId} #__ll_master`)     
            if(!!ele){
                ele.innerHTML = `
                    <img id='llc_${options.lazyloadCount}' class='__si' />
                `
                setTimeout(() => {
                    let _ele = document.querySelector(`#${randomId} #llc_${options.lazyloadCount}`)   
                    if(!!_ele){
                        _ele.src = image
                        _ele.timerEvent = setInterval(() => {                                                
                            if(_ele.height > 0){                        
                                clearInterval(_ele.timerEvent)
                                setTimeout(() => { callback() }, 1)               
                            }                              
                        })
                    }
                })
            }
            else{
                callback()
            }
        }
        else{
            callback()
        }
    }

    imageLoadedCheck(callback){
      let {randomId, options} = this;
      clearInterval(this.options.lazyloadEvent)
      this.options.lazyloadEvent = setInterval(() => {
        let pass = true
        document.querySelectorAll(`#${randomId} .__preloadimgs`).forEach((img, index) => {                    
          if(img.height === 0){
            pass = false
          }
        }) 
        if(pass){
          clearInterval(this.options.lazyloadEvent)
          callback()
        }                       
      }, 1)
      
    }

    setImageLoading(state){
        let {randomId, options} = this
        const renders = () => {
          let ele = document.querySelector(`#${randomId} .__loading`);  
          if(!!ele){
            ele.style.backgroundColor = `rgba(0, 0, 0, ${state ? 0.5  : 0})` 
            ele.style.opacity =  state ? 1 : 0          
          }
        }

        if(options.lazyload){
          if(state){
            options.lazyloadEvent = setTimeout(() => {
              renders()
            }, options.lazyloadThreshold+options.speed)                  
          }
          else{
            renders()
            clearInterval(options.lazyloadEvent)  
          }
        }
    }

    removeImageOnCard(cardIndex = 0){
        let {cards, images} = this;
        cards[this.determineType()][cardIndex].innerHTML = `
            <div style='width: 100%; height: 100%;'></div>
        `   
    }    

    setUnderlay(image, duration, callback = () => {}){
        let {randomId, options} = this
        let ele = document.querySelector(`#${randomId} .__underlay`);  
        this.preloadImage(image, () => {              
            if(!!ele){
                // renders container (timer is to hide until ready)
                ele.setAttribute('style', `position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 1`);
                // renders background image
                ele.innerHTML = `
                    <div style='width: calc(100% - ${options.padding*2}px); height: calc(100% - ${options.padding*2}px); float: left;padding: ${options.padding}px;'>
                        <div style='width: 100%;height: 100%; display: flex;align-items: center; justify-content: center;color: white;'>
                            <div style='background: url(${image}) no-repeat center center; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover; width: 100%; height: 100%; opacity: 1'></div>
                        </div>
                    </div>                    
                ` 
            }              
            callback()
        })        
    }

    hideUnderlay(){
        let {randomId} = this
        let ele = document.querySelector(`#${randomId} .__underlay`);
        if(!!ele){
            ele.innerHTML = `
                <div></div>
            `    
        }
    }

    setOverlay(image, callback = () => {}){
        let {options, randomId} = this;
        let ele = document.querySelector(`#${randomId} .__overlay`);  
        //this.preloadImage(image, () => {
            if(!!ele){
                ele.innerHTML = `
                    <div style='width: calc(100% - ${options.padding*2}px); height: calc(100% - ${options.padding*2}px); float: left;padding: ${options.padding}px;'>
                        <div style='width: 100%;height: 100%; display: flex;align-items: center; justify-content: center;color: white;'>
                            <div style='background: url(${image}) no-repeat center center; -webkit-background-size: cover; -moz-background-size: cover; -o-background-size: cover; background-size: cover; width: 100%; height: 100%; opacity: 1;'></div>
                        </div>
                    </div>                    
                `      
            }    

        //})
        setTimeout(() => {                
            callback()
        }, 100)
    }

    hideOverlay(){
        let {randomId} = this
        let ele = document.querySelector(`#${randomId} .__overlay`);
        ele.innerHTML = `
            <div></div>
        `   
    }


    animateText(reversed){
      let {options} = this
      this.texts.ele.forEach((ele, index) => {
        if(this.animejsInstalled){
            anime.timeline()
            .add({        
                targets: ele,
                duration: options.speed/2,
                easing: 'easeInSine',
                translateX: reversed ? 0 : index === 0 ? 5 : -5,
                opacity: reversed ? 1 : 0,
                delay: index*options.speed/4, 
                complete: () => {
                if(!reversed){
                    this.loadText()
                }
                }
            });
        }
        else{
            ele.style.transform = `translateX(${reversed ? 0 : index === 0 ? 5 : -5})`
            ele.style.opacity =  reversed ? 1 : 0
            if(!reversed){
                this.loadText()
            }            
        }
      })      
    }

    loadText(){      
      let {texts, images, currentImage} = this;      
      texts.header.updateText(images[currentImage].header)
      texts.footer.updateText(images[currentImage].footer)
    }



    next(amount = 1){      
        let {images} = this;
        this.previousImage = this.currentImage
        this.currentImage = this.getNext(1)        
        this.setImageLoading(true)
        this.setImageOnCard(0, this.currentImage, () => {            
           this.animate(false, () => {})            
        })        
    }

    prev(amount = 1){
        let {images} = this;
        this.previousImage = this.currentImage
        this.currentImage = this.getPrev(1)    
        this.setImageLoading(true)
        this.setImageOnCard(2, this.currentImage, () => {                
            this.animate(true, () => {
                
            })
        })
    }

    lock(state = false){
        let {options, buttons, inputElements} = this
        inputElements.forEach(ele => {
            if(ele.classList.contains('__button')){
              ele.setAttribute('style', `display: ${options.controls ? 'visible' : 'none'}; opacity: ${state ? 0.65 : 1} `)
            }
            if(ele.classList.contains('__dot')){
              ele.setAttribute('style', `display: ${options.dots ? 'visible' : 'none'};`)
            }            
        })
        buttons.locked = state
    }

    markActiveDot(){
        let {randomId, currentImage} = this
        document.querySelectorAll(`#${randomId} .__dot`).forEach((ele, index) => {     
            ele.classList.remove('vj-slider--dots-item--active', 'vj-slider--dots-item--inactive');
            ele.classList.add(currentImage === index ? 'vj-slider--dots-item--active' : 'vj-slider--dots-item--inactive');            
        })        
    }

    animate(reversed = false, callback = () => {}){
        let {images, currentImage, previousImage, randomId, cards, options} = this;
        let _overlay = document.querySelector(`#${randomId} .__overlay`) 
        let duration = options.speed;
        this.markActiveDot();
        this.animateText(false)
        
        const completed = () => {                        
        this.lock(false)
          this.setActiveCard(() => {
            this.resetPosition(false)
            //this.hideUnderlay()            
            callback()                
          })
        }

        const end = () => {
          this.animateText(true)        
        }

        // horizontal/overlay sliders
        if(this.determineType() === 'h'){

            switch(options.type){
                case 'slide':
                    this.setUnderlay(images[currentImage].src, duration, () => {
                        cards[this.determineType()].forEach((card, index) => {  
                            this.setImageLoading(false)    
                            if(this.animejsInstalled){                    
                                anime({
                                    targets: card,
                                    duration, 
                                    easing: options.easing,
                                    translateX: reversed ? `-100%` : `100%`,
                                    complete: () => {
                                        if(index === 1){
                                            completed();
                                            end()
                                        }
                                    }
                                });
                            }
                            else{
                                card.style.transform = `translateX(${ reversed ? `-100%` : `100%`})`
                                if(index === 1){
                                    completed();
                                    end()
                                }                                
                            }
                        })
                    })
                break
                case 'slip':
                    this.hideOverlay()
                    anime({
                        targets: document.querySelector(`#${randomId} .__overlay`),
                        duration: 0, 
                        translateX: reversed ? `-100%` : `100%`,                     
                    })                       
                    this.setOverlay(images[currentImage].src, () => {    
                        this.setImageLoading(false)                                                        
                        anime({
                            targets: document.querySelector(`#${randomId} .__overlay`),
                            easing: options.easing,
                            duration,
                            translateX: 0,
                            complete: () => {
                                this.setActiveCard()
                                this.lock(false)
                                end()
                            }
                        })                                                
                    })
                break                
                case 'fade':           
                    _overlay.style.opacity = 1
                    this.setOverlay(images[previousImage].src, () => {                                      
                        this.setActiveCard(() => {                             
                            anime({
                                targets: document.querySelector(`#${this.randomId} .__overlay`),
                                duration: duration, 
                                easing: options.easing,
                                opacity: 0,
                                complete: () => {
                                    this.lock(false)
                                    this.setImageLoading(false)                                          
                                    end()
                                }
                            })
                        })
                    })                                
                break  
                case 'grow':    
                    _overlay.style.opacity = 1           
                    _overlay.style.transform = 'scale(1) rotate(0)'                        
                    this.setOverlay(images[previousImage].src, () => {                       
                        this.setActiveCard(() => {
                          this.setImageLoading(false)    
                          anime.timeline()              
                              .add({
                                  targets: document.querySelector(`#${randomId} .__overlay`),
                                  duration: duration, 
                                  easing: options.easing,
                                  scale:  !reversed ? 1.25 : 0.95,
                                  opacity: 0,
                                  complete: () => {
                                      this.lock(false)
                                      end()
                                  }
                              })
                        })                            
                    })                                
                break  
                case 'skew':        
                    _overlay.style.opacity = 1           
                    _overlay.style.transform = 'scale(1) rotate(0)'
                    this.setOverlay(images[previousImage].src, () => {                       
                        this.setActiveCard(() => {
                            this.setImageLoading(false)    
                            anime.timeline()                 
                                .add({
                                    targets: document.querySelector(`#${randomId} .__overlay`),
                                    duration: duration, 
                                    easing: options.easing,
                                    rotate:  !reversed ? 20 : -20,
                                    scale:  !reversed ? 1.25 : 0.95,
                                    opacity: 0,
                                    complete: () => {
                                        this.lock(false)
                                        end()
                                    }
                                })
                        })
                    })                                
                break  
                case 'leaf':            
                    _overlay.style.transform = `translateX(0) translateY(0) scale(1) rotate(0)`        
                    _overlay.style.opacity = 1                  
                    this.setOverlay(images[previousImage].src, () => {                       
                        this.setActiveCard(() => {
                            this.setImageLoading(false)    
                            anime.timeline()                
                              .add({
                                  targets: document.querySelector(`#${randomId} .__overlay`),
                                  duration: duration, 
                                  easing: options.easing,
                                  rotate:  reversed ? -45 : 45,
                                  scale:  reversed ? 0.9 : 1.25,
                                  translateX: reversed ? '-50%' : '50%',
                                  translateY: reversed ? '-50%' : '50%',
                                  opacity: 0,
                                  complete: () => {
                                      this.lock(false)
                                      end()
                                  }
                              })
                        })
                    })                                
                break        
                case 'warpspeed':     
                    _overlay.style.transform = `scaleX(100)`        
                    _overlay.style.opacity = 1  
                    this.setOverlay(images[currentImage].src, () => {                       
                        this.setActiveCard(() => {
                            this.setImageLoading(false)    
                            anime.timeline()                 
                              .add({
                                  targets: document.querySelector(`#${randomId} .__overlay`),
                                  duration: duration, 
                                  easing: options.easing,                                
                                  scaleX: 5,
                                  opacity: 0,
                                  complete: () => {
                                      this.lock(false)
                                      end()
                                  }
                              })
                        })
                    })                                
                break  
                case 'hyperzoom':                               
                    _overlay.style.transform = 'scale(100)'
                    this.setOverlay(images[currentImage].src, () => {                       
                        this.setActiveCard(() => {
                            this.setImageLoading(false)    
                            anime.timeline()             
                              .add({
                                  targets: document.querySelector(`#${randomId} .__overlay`),
                                  duration: duration, 
                                  easing: options.easing,                                
                                  scale: 1,
                                  opacity: 1,
                                  complete: () => {
                                      this.lock(false)
                                      end()
                                  }
                                })
                        })
                    })                                
                break    
                case 'newsroom':       
                    _overlay.style.transform = `scale(10) rotate(${reversed ? -240 : 240}deg)`
                    this.setOverlay(images[currentImage].src, () => {                       
                        this.setActiveCard(() => {
                          this.setImageLoading(false)    
                          anime.timeline()                
                              .add({
                                  targets: document.querySelector(`#${randomId} .__overlay`),
                                  duration: duration, 
                                  easing: options.easing,                                
                                  scale: 1,
                                  rotate: 0,
                                  opacity: 1,
                                  complete: () => {
                                      this.lock(false)
                                      end()
                                  }
                              })
                        })
                    })                                
                break  
                case 'flip':       
                    _overlay.style.transform = `scaleY(1)`     
                    this.setOverlay(images[previousImage].src, () => {                       
                      this.setActiveCard(() => {
                        this.setImageLoading(false)    
                        anime.timeline()                   
                            .add({
                                targets: document.querySelector(`#${randomId} .__overlay`),
                                duration: duration, 
                                easing: options.easing,                                
                                scaleY: 0,
                                complete: () => {
                                    this.lock(false)
                                    end()
                                }
                            })
                      })
                    }) 
                  break 
                  case 'fold':        
                    _overlay.style.transform = `scaleX(1)`     
                    this.setOverlay(images[previousImage].src, () => {                       
                      this.setActiveCard(() => {
                        this.setImageLoading(false)    
                        anime.timeline()                 
                            .add({
                                targets: document.querySelector(`#${randomId} .__overlay`),
                                duration: duration, 
                                easing: options.easing,                                
                                scaleX: 0,
                                complete: () => {
                                    this.lock(false)
                                    end()
                                }
                            })
                        })
                    })                                                    
                break    
                case 'unfold':       
                  _overlay.style.transform = `scaleX(0)`          
                  this.setOverlay(images[currentImage].src, () => {   
                      this.setImageLoading(false)                        
                      anime.timeline()                
                          .add({
                              targets: document.querySelector(`#${randomId} .__overlay`),
                              duration: duration, 
                              easing: options.easing,                                
                              scaleX: 1,
                              complete: () => {
                                  this.setActiveCard()
                                  this.lock(false)
                                  end()
                              }
                          })
                  }) 
                break
                case 'unflip':    
                  _overlay.style.transform = `scaleY(0)`         
                  this.setOverlay(images[currentImage].src, () => {      
                      this.setImageLoading(false)                     
                      anime.timeline()                  
                          .add({
                              targets: document.querySelector(`#${randomId} .__overlay`),
                              duration: duration, 
                              easing: options.easing,                                
                              scaleY: 1,
                              complete: () => {
                                  this.setActiveCard()
                                  this.lock(false)
                                  end()
                              }
                          })
                  })                                                                    
                break                                                                                                                                          
            }
        }

        // vertical sliders
        if(this.determineType() === 'v'){

            switch(options.type){
                case 'cascade':
                    this.setUnderlay(images[currentImage].src, duration, () => {
                        cards[this.determineType()].forEach((card, index) => {
                            this.setImageLoading(false)  
                            anime({
                                targets: card,
                                duration, 
                                easing: options.easing,
                                translateY: reversed ? `-100%` : `100%`,
                                complete: () => {
                                    if(index === 1){
                                        completed()
                                        end()
                                    }
                                }                    
                            });
                        })
                    })
                break
                case 'waterfall':
                _overlay.style.transform = `translateY(${reversed ? `100%` : `-100%`})`   
                this.hideOverlay()                    
                    this.setOverlay(images[currentImage].src, () => {   
                        this.setImageLoading(false)                                     
                        anime({
                            targets: document.querySelector(`#${randomId}  .__overlay`),
                            easing: options.easing,
                            duration,
                            translateY: 0,
                            complete: () => {
                                this.setActiveCard()
                                this.lock(false)
                                end()
                            }
                        })                                                
                    })
                break
            }
        }     
        
        
    }

    resetPosition(hide){
        let {cards} = this;
    
        cards[this.determineType()].forEach((card, index) => {
            card.style.transform = 'translate(0) scale(1)'
            card.style.opacity = hide ? 0 : 1
            if(index === 0 || index === 2){
                this.removeImageOnCard(index)
            }
        })        
    }
}
