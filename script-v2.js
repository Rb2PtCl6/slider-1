export default class viewer{
    #data = []
    #pointer = {}
    #active_slide = localStorage.getItem("test_active_slide") | 0
    #max_slide = 1
    constructor(pointer, json_url){
        this.#pointer = pointer;
        this.readJson(json_url)
        .then((images) =>{
            this.#max_slide = images.length
            for (let i = 0; i < this.#max_slide; i++) {
                this.#data[i] = { id: i, url: images[i], is_loaded: false };
            }
            this.#validate_active_slide()
            console.log(this.#data)
            this.makeSelect("header")
            this.setCurrentNumberInSelect()
            this.handleSelect()
            this.fillViewer()
            this.changeHandler(this.#pointer.controls.prew_id, this.#pointer.controls.next_id)
        })
        .catch(error => {
            console.error(`Error fetching JSON from ${json_url}`, error);
        });
    }
    /* пофиксить проблему с индексими больше размера массива + 1 и с индексами меньше нуля*/
    #validate_active_slide(){
        //console.log(this.#active_slide)
        if (this.#active_slide < 0){
            this.#active_slide = 0
        } else if (this.#active_slide + 1 >= this.#max_slide){
            this.#active_slide = this.#max_slide - 1
        }
        //console.log(this.#active_slide)
    }
    fillViewer(){
        this.#data.forEach((_,i) => {
            this.createRawBox(this.#pointer.reader_id, `page${i}`)
        })
        this.toggleHidden(`page${this.#active_slide}`)
        this.load_first()
    }
    load_first(){
        //console.log(this.#data[this.#active_slide].url)
        this.downloadImage(this.#active_slide,this.#data[this.#active_slide].url)
        this.#data[this.#active_slide].is_loaded = true
        this.makeId("selection").selectedIndex = this.#active_slide
    }
    makeSelect(id){
        var elem = document.createElement("select")
        elem.id = "selection"
        elem.name = "selection"
        var tmp = ""
        for(var i = 0; i < this.#max_slide; i++){
            if (i == this.#active_slide){
                tmp += `<option selected value="${i}">${i + 1} / ${this.#max_slide}</option>`
            } else{
                tmp += `<option value="${i}">${i + 1} / ${this.#max_slide}</option>`
            }
        }
        elem.innerHTML = tmp
        this.makeId(id).append(elem)
    }
    /**
     * @param {string} where_element
     * @param {string} id
     */
    createRawBox(where_element, id){
        var elem = document.createElement("div")
        elem.id = id
        elem.classList.add("page","loading","hidden")
        elem.innerHTML = "<img class='page_img'></img>"
        this.makeId(where_element).append(elem)
    }
    // operations with numbers
    /**
     * @return {number}
     */
    get getCurrentNumber(){ 
        return this.#active_slide
    }
    /**
     * @param {number} num
     */
    setCurrentNumber(num){
        this.#active_slide = num
        localStorage.setItem("test_active_slide",num)
        this.setCurrentNumberInSelect(num)
    }
    // block's changers
    setCurrentNumberInSelect(num){
        this.makeId("selection").selectedIndex = num
    }
    nextImage(){
        //console.log(this.#data)
        //console.log("next")
        var current = this.getCurrentNumber
        var this_id = `page${current}`
        var next_id = `page${current+1}`
        if (current < this.#max_slide - 1){
            this.toggleHidden(this_id)
            this.toggleHidden(next_id)
            this.setCurrentNumber(current+1)
            if (!this.#data[this.#active_slide].is_loaded){
                //console.log("open next")
                this.downloadImage(this.#active_slide)
                this.#data[this.#active_slide-1].is_loaded = true
            }
        }
    }
    prevImage(){
        //console.log("prew")
        var current = this.getCurrentNumber
        var this_id = `page${current}`
        var prew_id = `page${current-1}`
        if (current > 0){
            this.toggleHidden(this_id)
            this.toggleHidden(prew_id)
            this.setCurrentNumber(current - 1)
            if (!this.#data[this.#active_slide].is_loaded){
                this.downloadImage(this.#active_slide)
                this.#data[this.#active_slide].is_loaded = true
            }
        }
    }
    // hide/shiw bloks
    toggleHidden(id){
        this.makeId(id).classList.toggle("hidden")
    }
    // remove loading icon
    removeLoading(id){
        this.makeId(id).classList.remove("loading")
    }
    /**
     * @return {HTMLElement}
     */
    makeId(id){
        return document.getElementById(id)
    }
    selectSize(id, img_h, img_w){
        var classes = ["page_img_auto_100","page_img_100_auto"];
        //alert(`img: { w: ${img_w}, h: ${img_h}}\nblock: { w: ${document.querySelector(`#page${id}`).clientWidth}, h: ${document.querySelector(`#page${id}`).clientHeight}}`)
        var block_height = this.makeId(id).clientHeight;
        var block_width = this.makeId(id).clientWidth;
    
        var img_props = img_w / img_h;
        var block_props = block_width / block_height;
    
        if (img_props > block_props){
            return classes[1];
        } else {
            return classes[0];
        }
    }
    changeSlide(new_num){
        console.log("change")
        var current = this.getCurrentNumber
        var this_id = `page${current}`
        var new_id = `page${new_num}`
        if (true){
            this.toggleHidden(this_id)
            this.toggleHidden(new_id)
            this.setCurrentNumber(new_num)
            if (!this.#data[this.#active_slide].is_loaded){
                this.downloadImage(this.#active_slide)
                this.#data[this.#active_slide].is_loaded = true
            }
        }
    }
    // event handlers
    handleSelect(){
        var _this = this
        this.makeId("selection").addEventListener("change",function(){
            var selected = _this.makeId("selection").selectedIndex
            console.log(selected)
            _this.changeSlide(selected)
        })
    }
    changeHandler(prew_arrow_element, next_arrow_element){
        var _this = this
        document.onkeydown = function(e){
            if (e.key == "ArrowLeft"){
                (function(){
                    _this.prevImage()
                })()
            } else if (e.key == "ArrowRight"){
                (function(){
                    _this.nextImage()
                })()
            }
        }
        this.makeId(prew_arrow_element).addEventListener("click",function(){
            _this.prevImage()
        })
        this.makeId(next_arrow_element).addEventListener("click",function(){
            _this.nextImage()
        })
    }
    // network
    async readJson(url){
        var response = await fetch(url)
        var json = await response.json();
        return Object.values(json)
    }
    downloadImage(id){
        //console.log(url)
        var this_ = this
        var downImage = new Image
        downImage.onload = function(){ 
            this_.removeLoading(`page${id}`)
            //document.querySelector(`#page${id} img`).style.aspectRatio = `${downImage.width}/${downImage.height}`;
            document.querySelector(`#page${id} img`).classList.add(this_.selectSize(`page${id}`, downImage.height, downImage.width))
            document.querySelector(`#page${id} img`).src = this.src
        }
        downImage.src = this.#data[id].url
    }
}